import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Person } from '../types';
import { cn } from '../lib/utils';

interface PeopleStageProps {
  people: Person[];
  onNext: (people: Person[]) => void;
  onBack: () => void;
}

export default function PeopleStage({ people: initialPeople, onNext, onBack }: PeopleStageProps) {
  const [people, setPeople] = useState<Person[]>(
    initialPeople.length > 0 ? initialPeople : [{ id: `p_${Date.now()}`, name: 'Me' }]
  );

  const addPerson = () => {
    setPeople([...people, { id: `p_${Date.now()}`, name: `Person ${people.length + 1}` }]);
  };

  const updatePerson = (id: string, name: string) => {
    setPeople(people.map(p => p.id === id ? { ...p, name } : p));
  };

  const removePerson = (id: string) => {
    if (people.length > 1) {
      setPeople(people.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-text-primary">Who's paying?</h2>
        <p className="text-text-secondary">Add everyone involved in this split.</p>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <AnimatePresence>
          {people.map((person, idx) => (
            <motion.div 
              key={person.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <User size={20} />
              </div>
              <input
                type="text"
                value={person.name}
                onChange={(e) => updatePerson(person.id, e.target.value)}
                className="flex-1 bg-transparent border-b-2 border-border focus:border-brand-primary focus:outline-none text-xl font-medium px-2 py-2 transition-colors text-text-primary"
                placeholder="Enter name..."
                autoFocus={idx === people.length - 1 && idx !== 0}
              />
              <button 
                onClick={() => removePerson(person.id)}
                disabled={people.length === 1}
                className={cn(
                  "p-3 rounded-xl transition-all",
                  people.length === 1 
                    ? "opacity-50 cursor-not-allowed text-text-secondary" 
                    : "text-text-secondary hover:text-brand-accent-1 hover:bg-brand-accent-1/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                )}
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={addPerson}
          className="w-full flex items-center justify-center gap-2 py-4 mt-4 rounded-xl border border-dashed border-border text-slate-300 hover:border-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-all font-medium"
        >
          <Plus size={20} /> Add Another Person
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
         <button 
            onClick={onBack}
            className="glass-button-secondary flex items-center justify-center gap-2 py-4 order-2 md:order-1"
          >
            <ArrowLeft size={20} /> Back to Receipt
          </button>
          <button 
            onClick={() => onNext(people)}
            className="glass-button flex items-center justify-center gap-2 py-4 text-lg order-1 md:order-2"
          >
            Assign Items <ArrowRight size={20} />
          </button>
      </div>
    </div>
  );
}
