import { ThemeToggle } from './ThemeToggle';
import './Navbar.css';

interface NavbarProps {
  currentStage: number;
}

export function Navbar({ currentStage }: NavbarProps) {
  const stages = [
    { id: 1, name: 'Upload Bill' },
    { id: 2, name: 'Verify Bill' },
    { id: 3, name: 'Add People' },
    { id: 4, name: 'Assign Items' },
    { id: 5, name: 'Split & Download' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">💸</div>
        <div className="logo-text">
          <h1>BillBreaker</h1>
          <span className="subtitle">Split bills, not friendships.</span>
        </div>
      </div>
      
      <div className="navbar-stages">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className={`stage-indicator ${currentStage === stage.id ? 'active' : ''} ${currentStage > stage.id ? 'completed' : ''}`}
          >
            <div className="stage-number">{stage.id}</div>
            <span className="stage-name">{stage.name}</span>
          </div>
        ))}
      </div>

      <div className="navbar-actions">
        <ThemeToggle />
      </div>
    </nav>
  );
}
