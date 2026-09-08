import { Navbar } from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      
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
