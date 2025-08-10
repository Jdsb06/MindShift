import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colorScheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  
  // Handle animation when theme changes
  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, 750);
    
    return () => clearTimeout(animationTimeout);
  }, [isDark]);
  
  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Create ripple effect
    if (buttonRef.current) {
      const button = buttonRef.current;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      
      ripple.className = 'absolute rounded-full bg-white/30 animate-ping';
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
      ripple.style.left = `${position.x - rect.left - (rect.width * 1)}px`;
      ripple.style.top = `${position.y - rect.top - (rect.height * 1)}px`;
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 750);
    }
  };
  
  // Track mouse position for ripple effect
  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };
  
  // Define color scheme-specific gradients
  const getGradients = () => {
    if (isDark) {
      switch(colorScheme) {
        case 'ocean':
          return 'from-blue-300/20 to-cyan-400/20';
        case 'sunset':
          return 'from-amber-300/20 to-orange-400/20';
        case 'forest':
          return 'from-emerald-300/20 to-green-400/20';
        case 'lavender':
          return 'from-violet-300/20 to-fuchsia-400/20';
        default:
          return 'from-yellow-300/20 to-orange-400/20';
      }
    } else {
      switch(colorScheme) {
        case 'ocean':
          return 'from-blue-500/20 to-cyan-600/20';
        case 'sunset':
          return 'from-amber-500/20 to-red-600/20';
        case 'forest':
          return 'from-emerald-500/20 to-green-600/20';
        case 'lavender':
          return 'from-violet-500/20 to-purple-600/20';
        default:
          return 'from-blue-500/20 to-indigo-600/20';
      }
    }
  };
  
  // Define glow colors based on theme
  const getGlowColor = () => {
    if (isDark) {
      switch(colorScheme) {
        case 'ocean':
          return 'drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]';
        case 'sunset':
          return 'drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]';
        case 'forest':
          return 'drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]';
        case 'lavender':
          return 'drop-shadow-[0_0_4px_rgba(167,139,250,0.8)]';
        default:
          return 'drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]';
      }
    } else {
      switch(colorScheme) {
        case 'ocean': 
          return 'drop-shadow-[0_0_4px_rgba(3,105,161,0.8)]';
        case 'sunset':
          return 'drop-shadow-[0_0_4px_rgba(194,65,12,0.8)]';
        case 'forest':
          return 'drop-shadow-[0_0_4px_rgba(4,120,87,0.8)]';
        case 'lavender':
          return 'drop-shadow-[0_0_4px_rgba(109,40,217,0.8)]';
        default:
          return 'drop-shadow-[0_0_4px_rgba(79,70,229,0.8)]';
      }
    }
  };
  
  return (
    <div className="relative group">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        onMouseMove={handleMouseMove}
        className={`relative flex items-center justify-center overflow-hidden p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 group
          ${isDark 
            ? 'bg-gray-900/40 text-yellow-300 hover:bg-gray-800/60' 
            : 'bg-white/30 text-blue-600 hover:bg-white/50'}`}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onFocus={() => setTooltip(true)}
        onBlur={() => setTooltip(false)}
      >
        {/* Inner shadow ring */}
        <span className={`absolute inset-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
          isDark ? 'bg-gray-700/30' : 'bg-white/50'
        }`}></span>
        
        {/* Animated background effect */}
        <span 
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getGradients()} 
            ${isAnimating ? 'animate-pulse opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        ></span>
        
        {/* Border glow */}
        <span className={`absolute inset-0 rounded-full border ${
          isDark 
            ? 'border-yellow-500/10 group-hover:border-yellow-500/30' 
            : 'border-blue-500/10 group-hover:border-blue-500/30'
          } transition-colors duration-300`}
        ></span>
        
        {isDark ? (
          <svg 
            className={`w-5 h-5 animate-scale-in relative z-10 ${getGlowColor()}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          <svg 
            className={`w-5 h-5 animate-scale-in relative z-10 ${getGlowColor()}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
      
      {/* Tooltip with glassmorphism */}
      <div 
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 
          backdrop-blur-md rounded text-xs font-medium pointer-events-none transition-all duration-200 
          ${tooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          ${isDark 
            ? 'bg-gray-900/80 text-gray-200 border border-gray-700/50' 
            : 'bg-white/80 text-gray-800 border border-gray-200/50'}`}
        style={{ 
          boxShadow: isDark 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          minWidth: '120px',
          textAlign: 'center'
        }}
      >
        Switch to {isDark ? 'light' : 'dark'} mode
      </div>
    </div>
  );
}