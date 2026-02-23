import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <div className="theme-toggle-wrapper">
      <div className="relative">
        <input 
          type="checkbox" 
          className="bb8-toggle" 
          checked={isDark} 
          onChange={toggleTheme} 
          title="Toggle Dark Mode"
        />
        <div className="scenery">
          <div className="stars">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
          <div className="moon">
            <div className="moon-craters"></div>
          </div>
          <div className="sun"></div>
          <div className="sun-2"></div>
          <div className="clouds"></div>
          <div className="ground"></div>
        </div>
        <div className="bb8">
          <div className="bb8-antenna"></div>
          <div className="bb8-head">
            <div className="bb8-eye"></div>
            <div className="bb8-eye-small"></div>
          </div>
          <div className="bb8-body">
            <div className="circle circle-1">
              <div className="circle-core"></div>
              <div className="line line-1"></div>
              <div className="line line-2"></div>
              <div className="line line-3"></div>
              <div className="line line-4"></div>
            </div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
