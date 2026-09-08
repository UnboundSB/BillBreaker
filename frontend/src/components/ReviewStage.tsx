import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Bill, BillItem } from '../types';

interface ReviewStageProps {
  bill: Bill;
  onNext: (bill: Bill) => void;
  onBack: () => void;
}

export default function ReviewStage({ bill: initialBill, onNext, onBack }: ReviewStageProps) {
  const [bill, setBill] = useState<Bill>(initialBill);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const currency = bill.currency_symbol || '₹';

  // Math Validation
  const calculatedItemsTotal = bill.items.reduce((sum, item) => sum + (Number(item.item_total) || 0), 0);
  const itemsMismatch = Math.abs(calculatedItemsTotal - (Number(bill.subtotal) || 0)) > 0.05;
  
  const calculatedTotal = (Number(bill.subtotal) || 0) + (Number(bill.tax) || 0) + (Number(bill.service_charge) || 0) - (Number(bill.discount) || 0);
  const totalMismatch = Math.abs(calculatedTotal - (Number(bill.printed_total) || 0)) > 0.05;

  const handleItemChange = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...bill.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate item_total if qty or price changes
    if (field === 'quantity' || field === 'unit_price') {
      const q = Number(newItems[index].quantity) || 0;
      const p = Number(newItems[index].unit_price) || 0;
      newItems[index].item_total = (q * p).toFixed(2);
    }
    
    setBill({ ...bill, items: newItems });
  };

  const removeItem = (index: number) => {
    setBill({ ...bill, items: bill.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    const newItem: BillItem = {
      id: `item_${Date.now()}`,
      name: '',
      quantity: 1,
      unit_price: '0.00',
      item_total: '0.00'
    };
    setBill({ ...bill, items: [...bill.items, newItem] });
  };

  const handleGlobalChange = (field: keyof Bill, value: string | number) => {
    setBill({ ...bill, [field]: value });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Review Receipt</h2>
          <p className="text-text-secondary">Check the AI extraction and fix any mistakes.</p>
        </div>
      </div>

      {(itemsMismatch || totalMismatch) && (
        <div className="bg-brand-primary/10 border-l-4 border-brand-primary p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-brand-primary">Math Mismatch Detected</h3>
              <div className="mt-2 text-sm text-text-secondary">
                <ul className="list-disc pl-5 space-y-1">
                  {itemsMismatch && (
                    <li>The sum of all items ({currency}{calculatedItemsTotal.toFixed(2)}) doesn't match the Subtotal.</li>
                  )}
                  {totalMismatch && (
                    <li>The subtotal + fees - discounts ({currency}{calculatedTotal.toFixed(2)}) doesn't match the Printed Total.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {bill.confidence !== undefined && bill.confidence < 0.8 && (
        <div className="bg-brand-secondary/10 border-l-4 border-brand-secondary p-4 rounded-r-lg shadow-sm">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-brand-secondary">Low Confidence Extraction</h3>
              <p className="mt-1 text-sm text-text-secondary">The photo was hard to read. Fields highlighted in yellow may need your attention.</p>
            </div>
        </div>
      )}

      <div className="glass-panel p-6 space-y-6">
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-semibold text-text-secondary uppercase tracking-wider pb-2 border-b border-border">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>
          
          {bill.items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center group p-3 md:p-0 rounded-lg md:rounded-none bg-surface-bg/50 md:bg-transparent border border-white/5 md:border-transparent"
            >
              <div className="w-full md:col-span-5 flex justify-between items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  className={`w-full bg-transparent border-b ${item.confidence !== undefined && item.confidence < 0.8 ? 'border-brand-secondary/50 bg-brand-secondary/5' : 'border-transparent'} focus:border-brand-primary focus:outline-none transition-colors px-1 py-1 text-text-primary text-base font-medium truncate`}
                  placeholder="Item name"
                />
                <button 
                  onClick={() => removeItem(index)}
                  className="md:hidden p-2 text-text-secondary hover:text-brand-accent-1 hover:bg-brand-accent-1/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="w-full flex items-center gap-2 md:contents">
                <div className="flex-1 md:col-span-2 flex items-center md:block">
                  <span className="text-xs text-text-secondary uppercase md:hidden w-10 shrink-0">Qty</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full bg-surface-bg md:bg-transparent border border-border md:border-transparent md:border-b focus:border-brand-primary focus:outline-none text-center transition-colors px-2 py-1 rounded md:rounded-none text-text-primary"
                  />
                </div>
                <div className="flex-1 md:col-span-2 flex items-center md:block relative">
                  <span className="text-xs text-text-secondary uppercase md:hidden w-12 shrink-0">Price</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60 hidden md:inline">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className={`w-full bg-surface-bg md:bg-transparent border ${item.confidence !== undefined && item.confidence < 0.8 ? 'border-brand-secondary/50 bg-brand-secondary/5' : 'border-border md:border-transparent md:border-b'} focus:border-brand-primary focus:outline-none text-right transition-colors px-2 py-1 rounded md:rounded-none text-text-primary md:pl-6`}
                  />
                </div>
                <div className="flex-1 md:col-span-2 flex items-center justify-end md:block relative">
                  <span className="text-xs text-text-secondary uppercase md:hidden shrink-0 mr-2">Total</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60 hidden md:inline">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.item_total}
                    onChange={(e) => handleItemChange(index, 'item_total', e.target.value)}
                    className={`w-full max-w-[80px] md:max-w-none bg-transparent border-b ${item.confidence !== undefined && item.confidence < 0.8 ? 'border-brand-secondary/50 bg-brand-secondary/5' : 'border-transparent'} focus:border-brand-primary focus:outline-none text-right font-bold md:font-medium transition-colors px-1 py-1 text-brand-primary md:text-text-primary md:pl-6`}
                  />
                </div>
              </div>

              <div className="hidden md:flex col-span-1 justify-end">
                <button 
                  onClick={() => removeItem(index)}
                  className="p-2 text-text-secondary hover:text-brand-accent-1 hover:bg-brand-accent-1/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={addItem}
          className="flex items-center gap-2 text-brand-primary font-medium hover:text-brand-primary/80 transition-colors py-2"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-semibold text-lg text-text-primary border-b border-border pb-2">Totals & Fees</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center relative">
              <span className="text-text-secondary">Subtotal</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60">{currency}</span>
                <input
                  type="number" step="0.01"
                  value={bill.subtotal}
                  onChange={(e) => handleGlobalChange('subtotal', e.target.value)}
                  className="w-28 bg-subtle-bg border border-border rounded pl-6 pr-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Tax</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60">{currency}</span>
                <input
                  type="number" step="0.01"
                  value={bill.tax}
                  onChange={(e) => handleGlobalChange('tax', e.target.value)}
                  className="w-28 bg-subtle-bg border border-border rounded pl-6 pr-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Service Charge / Tip</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60">{currency}</span>
                <input
                  type="number" step="0.01"
                  value={bill.service_charge}
                  onChange={(e) => handleGlobalChange('service_charge', e.target.value)}
                  className="w-28 bg-subtle-bg border border-border rounded pl-6 pr-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Discount</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/60">{currency}</span>
                <input
                  type="number" step="0.01"
                  value={bill.discount}
                  onChange={(e) => handleGlobalChange('discount', e.target.value)}
                  className="w-28 bg-subtle-bg border border-border rounded pl-6 pr-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold text-lg text-text-primary">Printed Total</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-secondary">{currency}</span>
                <input
                  type="number" step="0.01"
                  value={bill.printed_total}
                  onChange={(e) => handleGlobalChange('printed_total', e.target.value)}
                  className="w-36 bg-subtle-bg border border-border rounded pl-6 pr-2 py-1 text-right focus:outline-none focus:border-brand-secondary transition-colors font-bold text-lg text-brand-secondary"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-end gap-4">
           <button 
              onClick={() => {
                if (itemsMismatch || totalMismatch) {
                  setShowWarningModal(true);
                  return;
                }
                onNext(bill);
              }}
              className="glass-button w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              Looks Good, Let's Split <ArrowRight size={20} />
            </button>
            <button 
              onClick={onBack}
              className="glass-button-secondary w-full flex items-center justify-center gap-2 py-4 text-lg"
            >
              <ArrowLeft size={20} /> Retake Photo
            </button>
        </div>
      </div>

      <AnimatePresence>
        {showWarningModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass p-6 max-w-sm w-full space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Math Mismatch</h3>
                <p className="text-text-secondary text-sm">
                  The receipt totals do not match exactly. The math is off. Are you sure you want to proceed anyway?
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowWarningModal(false)}
                  className="glass-button-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowWarningModal(false);
                    onNext(bill);
                  }}
                  className="glass-button flex-1 py-3 bg-brand-primary text-white"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
