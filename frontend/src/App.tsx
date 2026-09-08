import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Users, CheckSquare, Receipt, Sparkles, Sun, Moon } from 'lucide-react';
import type { Bill, Person, ItemAssignment, SplitResult } from './types';

// Stages
import UploadStage from './components/UploadStage';
import ReviewStage from './components/ReviewStage';
import PeopleStage from './components/PeopleStage';
import AssignmentStage from './components/AssignmentStage';
import ResultsStage from './components/ResultsStage';

export type Stage = 'upload' | 'review' | 'people' | 'assign' | 'results';

function App() {
  const [currentStage, setCurrentStage] = useState<Stage>('upload');
  const [bill, setBill] = useState<Bill | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [results, setResults] = useState<SplitResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const stages: { id: Stage; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Scan', icon: <Camera size={18} /> },
    { id: 'review', label: 'Review', icon: <Receipt size={18} /> },
    { id: 'people', label: 'People', icon: <Users size={18} /> },
    { id: 'assign', label: 'Assign', icon: <CheckSquare size={18} /> },
    { id: 'results', label: 'Done', icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="font-sans relative min-h-screen">
      <div className="w-full h-full absolute inset-0 z-[-1] bg-[#111111] transition-colors duration-500 overflow-hidden">
        {/* Background will go here */}
      </div>
      
      {/* Skeuomorphic Bezel - moved behind content (z-0) but above background (z-[-1]) */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block p-3 lg:p-5">
        <div className="w-full h-full skeuomorphic-frame pointer-events-none"></div>
      </div>
            
      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass !rounded-none !border-x-0 !border-t-0 px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm">
            <Sparkles className="text-white w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <h1 className="font-bold text-lg sm:text-xl tracking-tight text-text-primary">
            SplitSnap
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Stepper */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-w-[50vw] md:max-w-none">
            {stages.map((stage, idx) => {
              const isActive = currentStage === stage.id;
              const isPast = stages.findIndex((s) => s.id === currentStage) > idx;
              return (
                <div key={stage.id} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-secondary/20 text-brand-primary border border-brand-primary/30 shadow-sm'
                        : isPast
                        ? 'text-brand-secondary'
                        : 'text-text-secondary opacity-60'
                    }`}
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">{stage.icon}</span>
                    <span className={`${isActive ? 'block' : 'hidden md:block'}`}>{stage.label}</span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`w-2 sm:w-4 h-[2px] mx-1 rounded-full transition-colors ${isPast ? 'bg-brand-secondary/50' : 'bg-surface-tonal'}`} />
                  )}
                </div>
              );
            })}
          </nav>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 sm:p-2.5 rounded-xl bg-surface-tonal text-text-secondary hover:text-brand-primary border border-brand-accent-3/20 transition-colors flex-shrink-0"
            title="Toggle Day/Night"
          >
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-8 overflow-x-hidden min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {currentStage === 'upload' && (
              <UploadStage onUploadComplete={(b) => { setBill(b); setCurrentStage('review'); }} />
            )}
            {currentStage === 'review' && (
              <ReviewStage bill={bill!} onNext={(b) => { setBill(b); setCurrentStage('people'); }} onBack={() => setCurrentStage('upload')} />
            )}
            {currentStage === 'people' && (
              <PeopleStage people={people} onNext={(p) => { setPeople(p); setCurrentStage('assign'); }} onBack={() => setCurrentStage('review')} />
            )}
            {currentStage === 'assign' && (
              <AssignmentStage bill={bill!} people={people} assignments={assignments} onNext={(a, r) => { setAssignments(a); setResults(r); setCurrentStage('results'); }} onBack={() => setCurrentStage('people')} />
            )}
            {currentStage === 'results' && (
              <ResultsStage results={results!} onRestart={() => {
                setBill(null); setPeople([]); setAssignments([]); setResults(null); setCurrentStage('upload');
              }} />
            )}
          </motion.div>
        </AnimatePresence>
          </main>

    </div>
  );
}

export default App;
