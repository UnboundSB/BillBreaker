import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Users } from 'lucide-react';
import type { Bill, Person, ItemAssignment, SplitResult } from '../types';
import { cn } from '../lib/utils';

interface AssignmentStageProps {
  bill: Bill;
  people: Person[];
  assignments: ItemAssignment[];
  onNext: (assignments: ItemAssignment[], result: SplitResult) => void;
  onBack: () => void;
}

export default function AssignmentStage({ bill, people, assignments: initialAssignments, onNext, onBack }: AssignmentStageProps) {
  const [assignments, setAssignments] = useState<ItemAssignment[]>(
    initialAssignments.length > 0 ? initialAssignments : bill.items.map(item => ({
      item_id: item.id,
      person_ids: []
    }))
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePersonAssignment = (itemId: string, personId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.item_id !== itemId) return a;
      const isSelected = a.person_ids.includes(personId);
      return {
        ...a,
        person_ids: isSelected 
          ? a.person_ids.filter(id => id !== personId)
          : [...a.person_ids, personId]
      };
    }));
  };
  
  const toggleAllPeople = (itemId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.item_id !== itemId) return a;
      const allSelected = a.person_ids.length === people.length;
      return {
        ...a,
        person_ids: allSelected ? [] : people.map(p => p.id)
      };
    }));
  }

  // Ensure all items are assigned to at least one person
  const isComplete = useMemo(() => {
    return assignments.every(a => a.person_ids.length > 0);
  }, [assignments]);

  const handleCalculate = async () => {
    if (!isComplete) {
      setError("Please assign every item to at least one person.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bill, people, assignments })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate split');
      }

      const result: SplitResult = await response.json();
      onNext(assignments, result);
    } catch (err: any) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Assign Items</h2>
          <p className="text-text-secondary">Who had what? Select multiple people to split an item.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {bill.items.map((item, idx) => {
          const assignment = assignments.find(a => a.item_id === item.id);
          const selectedCount = assignment?.person_ids.length || 0;
          const allSelected = selectedCount === people.length;
          
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-5 space-y-4"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-text-primary truncate">{item.name}</h3>
                  <p className="text-sm text-text-secondary">Qty: {item.quantity} × ${Number(item.item_total).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => toggleAllPeople(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    allSelected 
                      ? "bg-brand-primary/20 border-brand-primary/30 text-brand-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]" 
                      : "bg-transparent border-border text-text-secondary hover:bg-subtle-bg hover:border-border"
                  )}
                >
                  <Users size={14} /> {allSelected ? "Shared by All" : "Split among all"}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {people.map(person => {
                  const isSelected = assignment?.person_ids.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => togglePersonAssignment(item.id, person.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 max-w-[150px] truncate",
                        isSelected 
                          ? "border-brand-secondary bg-brand-secondary/20 text-text-primary shadow-[0_0_10px_rgba(176,38,255,0.3)]"
                          : "border-transparent bg-subtle-bg text-text-secondary hover:bg-surface-tonal hover:text-text-primary"
                      )}
                    >
                      {person.name}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
          <button 
            onClick={onBack}
            className="glass-button-secondary flex items-center justify-center gap-2 py-4 order-2 md:order-1"
          >
            <ArrowLeft size={20} /> Back to People
          </button>
          
          <button 
            onClick={handleCalculate}
            disabled={!isComplete || isLoading}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-lg transition-all shadow-lg order-1 md:order-2",
              isComplete && !isLoading
                ? "glass-button"
                : "bg-subtle-bg text-text-secondary cursor-not-allowed shadow-none border border-border"
            )}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin text-brand-primary" /> : "Calculate Total"} <ArrowRight size={20} />
          </button>
      </div>
    </div>
  );
}
