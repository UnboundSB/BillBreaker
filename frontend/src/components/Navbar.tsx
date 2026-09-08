import { ThemeToggle } from './ThemeToggle';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">💸</div>
        <div className="logo-text">
          <h1>BillBreaker</h1>
          <span className="subtitle">Split bills, not friendships.</span>
        </div>
      </div>
      
      <div className="navbar-links">
        <a href="#" className="nav-link">Home</a>
        <a href="#" className="nav-link">Dashboard</a>
        <a href="#" className="nav-link">History</a>
      </div>

      <div className="navbar-actions">
        <ThemeToggle />
      </div>
    </nav>
  );
}
