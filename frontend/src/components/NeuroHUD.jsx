import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function NeuroHUD({ onEngage }) {
  const { colorScheme } = useTheme();
  const [showPulse, setShowPulse] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef(null);
  const dataPoints = useRef(Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: Math.random() * 5 + 3,
    pulse: Math.random() * 3 + 1
  }))).current;
  
  // Effect for pulsing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Mouse movement tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);
  
  // Get color scheme-specific gradient
  const getGradient = () => {
    switch (colorScheme) {
      case 'ocean':
        return 'from-blue-500 via-cyan-400 to-sky-500';
      case 'sunset':
        return 'from-amber-400 via-orange-500 to-red-500';
      case 'forest':
        return 'from-emerald-400 via-green-500 to-teal-500';
      case 'lavender':
        return 'from-violet-400 via-purple-500 to-fuchsia-500';
      default:
        return 'from-indigo-500 via-purple-500 to-pink-500';
    }
  };
  
  return (
    <section 
      ref={containerRef}
      className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Dynamic background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,16,30,1)_0%,rgba(0,0,0,1)_100%)]"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(66, 153, 225, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(66, 153, 225, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: 'center center',
        opacity: 0.4
      }}></div>
      
      {/* Orbital rings */}
      <div className="absolute w-[140%] h-[140%] rounded-full border border-cyan-900/30 animate-[spin_90s_linear_infinite]"></div>
      <div className="absolute w-[120%] h-[120%] rounded-full border border-blue-900/20 animate-[spin_60s_linear_reverse_infinite]"></div>
      <div className="absolute w-[100%] h-[100%] rounded-full border border-indigo-800/40 animate-[spin_45s_linear_infinite]"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-cyan-950/20"></div>
      
      {/* Central visualization */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getGradient()} opacity-5 blur-xl`}></div>
        <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${getGradient()} opacity-10 blur-lg`}></div>
        
        {/* Neural connections */}
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Connection lines */}
          {dataPoints.map((point, i) => (
            <g key={`connection-${i}`}>
              <line 
                x1="50" y1="50" 
                x2={point.x} y2={point.y} 
                stroke="url(#lineGradient)" 
                strokeWidth="0.4"
                className="opacity-60"
              />
            </g>
          ))}
          
          {/* Data nodes */}
          {dataPoints.map((point, i) => (
            <g key={`node-${i}`} filter="url(#glow)">
              <circle 
                cx={point.x} cy={point.y} 
                r={point.size} 
                className={`fill-cyan-400 ${showPulse ? 'animate-ping' : ''}`}
                style={{ animationDuration: `${point.pulse}s` }}
                opacity="0.7"
              />
              <circle 
                cx={point.x} cy={point.y} 
                r={point.size * 0.6} 
                className="fill-cyan-300"
              />
            </g>
          ))}
          
          {/* Central node */}
          <circle cx="50" cy="50" r="10" className="fill-white/80" filter="url(#glow)" />
          <circle cx="50" cy="50" r="8" className={`fill-cyan-400 ${showPulse ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
          <circle cx="50" cy="50" r="6" className="fill-indigo-500" />
        </svg>
        
        {/* Brain visualization overlaid */}
        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-40" 
          style={{ backgroundImage: "url('/logo.svg')" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
          Upgrade Your Focus.
        </h1>
        <p className="mt-4 text-cyan-200/80 text-lg max-w-lg mx-auto">
          Your neural interface is ready. Tap into heightened awareness and intention-driven productivity.
        </p>
        <button 
          onClick={onEngage} 
          className="group relative mt-10 px-12 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:scale-105"
          aria-label="Engage"
        >
          <span className="relative z-10">Engage Interface</span>
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
          
          {/* Animated ring around button on hover */}
          <span className="absolute -inset-1 rounded-full border border-cyan-400/30 scale-0 group-hover:scale-105 transition-all duration-500 opacity-0 group-hover:opacity-100"></span>
          <span className="absolute -inset-2 rounded-full border border-cyan-400/20 scale-0 group-hover:scale-105 transition-all duration-700 opacity-0 group-hover:opacity-100"></span>
        </button>
      </div>
    </section>
  );
} 