import { motion } from 'framer-motion';
import { RefreshCcw, AlertTriangle, Receipt, Download } from 'lucide-react';
import type { SplitResult } from '../types';

interface ResultsStageProps {
  results: SplitResult;
  onRestart: () => void;
}

export default function ResultsStage({ results, onRestart }: ResultsStageProps) {
  
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

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
          Bill Split Successfully!
        </h2>
        <p className="text-text-secondary">Here is the exact breakdown for everyone.</p>
      </div>

      {hasMismatch && (
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
    </div>
  );
}
