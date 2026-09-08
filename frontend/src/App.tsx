import { ThemeToggle } from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <h1>BillBreaker</h1>
          <p className="subtitle">Split bills, not friendships.</p>
        </div>
        <ThemeToggle />
      </header>
      
      <main className="app-main">
        <section className="palette-showcase">
          <div className="card">
            <h2>Let's Get Started</h2>
            <p>We've integrated your beautiful new color palette. Notice the seamless transition between the off-white beige and the sleek off-black backgrounds.</p>
            
            <div className="button-group">
              <button className="btn btn-primary">Primary Action</button>
              <button className="btn btn-accent">Secondary Action</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
