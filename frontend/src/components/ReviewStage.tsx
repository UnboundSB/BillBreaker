import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Bill, BillItem } from '../types';

interface ReviewStageProps {
  bill: Bill;
  onNext: (bill: Bill) => void;
  onBack: () => void;
}

export default function ReviewStage({ bill: initialBill, onNext, onBack }: ReviewStageProps) {
  const [bill, setBill] = useState<Bill>(initialBill);

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
                  className="w-full bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none transition-colors px-1 py-1 text-text-primary text-base font-medium truncate"
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
                <div className="flex-1 md:col-span-2 flex items-center md:block">
                  <span className="text-xs text-text-secondary uppercase md:hidden w-12 shrink-0">Price</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    className="w-full bg-surface-bg md:bg-transparent border border-border md:border-transparent md:border-b focus:border-brand-primary focus:outline-none text-right transition-colors px-2 py-1 rounded md:rounded-none text-text-primary"
                  />
                </div>
                <div className="flex-1 md:col-span-2 flex items-center justify-end md:block">
                  <span className="text-xs text-text-secondary uppercase md:hidden shrink-0 mr-2">Total</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.item_total}
                    onChange={(e) => handleItemChange(index, 'item_total', e.target.value)}
                    className="w-full max-w-[80px] md:max-w-none bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none text-right font-bold md:font-medium transition-colors px-1 py-1 text-brand-primary md:text-text-primary"
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
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Subtotal</span>
              <input
                type="number" step="0.01"
                value={bill.subtotal}
                onChange={(e) => handleGlobalChange('subtotal', e.target.value)}
                className="w-24 bg-subtle-bg border border-border rounded px-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Tax</span>
              <input
                type="number" step="0.01"
                value={bill.tax}
                onChange={(e) => handleGlobalChange('tax', e.target.value)}
                className="w-24 bg-subtle-bg border border-border rounded px-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Service Charge / Tip</span>
              <input
                type="number" step="0.01"
                value={bill.service_charge}
                onChange={(e) => handleGlobalChange('service_charge', e.target.value)}
                className="w-24 bg-subtle-bg border border-border rounded px-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Discount</span>
              <input
                type="number" step="0.01"
                value={bill.discount}
                onChange={(e) => handleGlobalChange('discount', e.target.value)}
                className="w-24 bg-subtle-bg border border-border rounded px-2 py-1 text-right focus:outline-none focus:border-brand-primary transition-colors text-text-primary"
              />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="font-semibold text-lg text-text-primary">Printed Total</span>
              <input
                type="number" step="0.01"
                value={bill.printed_total}
                onChange={(e) => handleGlobalChange('printed_total', e.target.value)}
                className="w-32 bg-subtle-bg border border-border rounded px-2 py-1 text-right focus:outline-none focus:border-brand-secondary transition-colors font-bold text-lg text-brand-secondary"
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-end gap-4">
           <button 
              onClick={() => onNext(bill)}
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
    </div>
  );
}
