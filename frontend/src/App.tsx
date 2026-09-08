import { ThemeToggle } from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>BillBreaker</h1>
        <ThemeToggle />
      </header>
      <main className="app-main">
        <p>Welcome to the new frontend!</p>
      </main>
    </div>
  )
}

export default App
