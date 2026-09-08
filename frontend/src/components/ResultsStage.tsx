import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, AlertTriangle, Receipt, Download, SlidersHorizontal, User, Save } from 'lucide-react';
import type { SplitResult, Bill, Person, ItemAssignment } from '../types';

interface ResultsStageProps {
  results: SplitResult;
  bill: Bill;
  people: Person[];
  assignments: ItemAssignment[];
  onUpdateResults: (newAssignments: ItemAssignment[], newResults: SplitResult) => void;
  onRestart: () => void;
}

export default function ResultsStage({ results, bill, people, assignments, onUpdateResults, onRestart }: ResultsStageProps) {
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [localAssignments, setLocalAssignments] = useState<ItemAssignment[]>(assignments);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const mismatch = Number(results.mismatch_amount);
  const hasMismatch = Math.abs(mismatch) > 0.01;
  const currency = results.currency_symbol || '$';

  const downloadPdf = async () => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bill_split.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF.");
    }
  };

  const handleShareChange = (itemId: string, personId: string, value: number) => {
    const updatedAssignments = localAssignments.map(a => {
      if (a.item_id === itemId) {
        const shares = { ...(a.person_shares || {}) };
        
        // If not initialized, initialize all assigned people to 100 before changing one
        if (Object.keys(shares).length === 0) {
          a.person_ids.forEach(pid => {
            shares[pid] = 100;
          });
        }
        
        shares[personId] = value;
        return { ...a, person_shares: shares };
      }
      return a;
    });
    setLocalAssignments(updatedAssignments);
  };

  const applySimulation = async () => {
    setIsCalculating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bill, people, assignments: localAssignments })
      });
      if (!res.ok) throw new Error("Calculation failed");
      const newResults = await res.json();
      onUpdateResults(localAssignments, newResults);
      setIsSimulatorMode(false);
    } catch(e) {
      console.error(e);
      alert("Failed to recalculate");
    } finally {
      setIsCalculating(false);
    }
  };

  // Find shared items (items assigned to > 1 person)
  const sharedItems = bill.items.filter(item => {
    const a = localAssignments.find(x => x.item_id === item.id);
    return a && a.person_ids.length > 1;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            {isSimulatorMode ? 'Simulator Mode' : 'Bill Split Successfully!'}
          </h2>
          <p className="text-text-secondary">
            {isSimulatorMode ? 'Adjust shares for shared items' : 'Here is the exact breakdown for everyone.'}
          </p>
        </div>
        
        {!isSimulatorMode ? (
          <button 
            onClick={() => setIsSimulatorMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-subtle-bg border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 transition-colors font-medium"
          >
            <SlidersHorizontal size={18} /> What-if Simulator
          </button>
        ) : (
          <button 
            onClick={applySimulation}
            disabled={isCalculating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary transition-colors font-medium"
          >
            <Save size={18} /> {isCalculating ? 'Calculating...' : 'Apply Changes'}
          </button>
        )}
      </div>

      {hasMismatch && !isSimulatorMode && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-3 text-amber-700 dark:text-amber-400"
        >
          <AlertTriangle className="shrink-0" />
          <div>
            <h4 className="font-semibold">Rounding Discrepancy</h4>
            <p className="text-sm opacity-90 mt-1">
              Due to sub-penny rounding on shared items, the total assigned amount differs from the printed receipt by {currency}{Math.abs(mismatch).toFixed(2)}. 
              {mismatch > 0 ? " Someone is paying slightly more." : " Someone is paying slightly less."}
            </p>
          </div>
        </motion.div>
      )}

      {isSimulatorMode ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {sharedItems.length === 0 ? (
            <div className="glass-panel p-8 text-center text-text-secondary">
              No shared items found. Go back to assign items to multiple people first.
            </div>
          ) : (
            sharedItems.map(item => {
              const assignment = localAssignments.find(a => a.item_id === item.id);
              if (!assignment) return null;
              
              const shares = assignment.person_shares || {};
              
              return (
                <div key={item.id} className="glass-panel p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <span className="text-brand-primary font-medium">{currency}{Number(item.item_total).toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {assignment.person_ids.map(pid => {
                      const person = people.find(p => p.id === pid);
                      const val = shares[pid] !== undefined ? shares[pid] : 100;
                      
                      return (
                        <div key={pid} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <User size={14} className="text-brand-primary" />
                          </div>
                          <div className="w-24 font-medium truncate">{person?.name}</div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={val}
                            onChange={(e) => handleShareChange(item.id, pid, parseInt(e.target.value))}
                            className="flex-1 accent-brand-primary"
                          />
                          <div className="w-12 text-right font-medium text-brand-primary">{val}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.people_breakdowns.map((person, idx) => (
            <motion.div
              key={person.person_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-shadow duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-text-primary">{person.name}</h3>
                <div className="text-2xl font-black text-brand-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                  {currency}{Number(person.total).toFixed(2)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-text-primary">{currency}{Number(person.items_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span className="font-medium text-text-primary">{currency}{Number(person.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Service / Tip</span>
                  <span className="font-medium text-text-primary">{currency}{Number(person.service_charge).toFixed(2)}</span>
                </div>
                {Number(person.discount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-medium">-{currency}{Number(person.discount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isSimulatorMode && (
        <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-subtle-bg border border-border flex items-center justify-center">
              <Receipt size={20} className="text-text-secondary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Printed Total: <span className="text-text-primary">{currency}{Number(results.printed_total).toFixed(2)}</span></p>
              <p className="text-xs text-text-secondary">Calculated Total: {currency}{Number(results.calculated_total).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={downloadPdf}
              className="w-full md:w-auto glass-button flex items-center justify-center gap-2 px-6 py-3"
            >
              <Download size={18} /> Download PDF
            </button>
            <button 
              onClick={onRestart}
              className="w-full md:w-auto glass-button-secondary flex items-center justify-center gap-2 px-6 py-3"
            >
              <RefreshCcw size={18} /> Split Another Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
