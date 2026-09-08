import { useEffect, useState } from 'react';
import './ThemeToggle.css';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="theme-toggle-container">
      <label className="theme-toggle">
        <input 
          type="checkbox" 
          className="theme-toggle-checkbox" 
          checked={isDark}
          onChange={(e) => setIsDark(e.target.checked)} 
        />
        <div className="theme-toggle-track">
          {/* Sky Backgrounds */}
          <div className="sky light-sky">
            {/* Clouds */}
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            <div className="cloud cloud-4"></div>
          </div>
          
          <div className="sky dark-sky">
            {/* Stars */}
            <div className="star star-1"></div>
            <div className="star star-2"></div>
            <div className="star star-3"></div>
            <div className="star star-4"></div>
            <div className="star star-5"></div>
          </div>

          {/* Sun / Moon Slider */}
          <div className="theme-toggle-thumb">
            <div className="sun-face"></div>
            <div className="moon-face">
              <div className="crater crater-1"></div>
              <div className="crater crater-2"></div>
              <div className="crater crater-3"></div>
            </div>
          </div>
        </div>
      </label>
    </div>
  );
}
