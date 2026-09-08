import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadStage } from './components/UploadStage';
import { VerifyStage } from './components/VerifyStage';
import { PeopleStage } from './components/PeopleStage';
import { AssignmentStage } from './components/AssignmentStage';
import { ResultsStage } from './components/ResultsStage';
import './App.css';

function App() {
  const [currentStage, setCurrentStage] = useState(1);

  // Helper function to auto-transfer to the next stage
  const nextStage = () => {
    if (currentStage < 5) {
      setCurrentStage(currentStage + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  return (
    <div className="app-container">
      <Navbar currentStage={currentStage} />
      
      <main className="app-main">
        {currentStage === 1 && <UploadStage onNext={nextStage} />}
        {currentStage === 2 && <VerifyStage onNext={nextStage} onPrev={prevStage} />}
        {currentStage === 3 && <PeopleStage onNext={nextStage} onPrev={prevStage} />}
        {currentStage === 4 && <AssignmentStage onNext={nextStage} onPrev={prevStage} />}
        {currentStage === 5 && <ResultsStage onPrev={prevStage} />}
      </main>
    </div>
  )
}

export default App;
