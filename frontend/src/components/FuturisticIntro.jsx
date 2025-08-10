import React, { useState, useEffect } from 'react';

export default function FuturisticIntro({ isOpen, onClose, durationMs = 4200 }) {
  const [progress, setProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState(0);
  
  const bootPhrases = [
    "Initializing neural interface",
    "Calibrating focus pathways",
    "Defragmenting attention streams",
    "Optimizing mind-machine symbiosis",
    "Establishing clarity protocols",
    "Activating mindfulness engine"
  ];
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Main timer for closing
    const closeTimer = setTimeout(onClose, durationMs);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (durationMs / 50));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);
    
    // Boot phases animation
    const bootInterval = setInterval(() => {
      setBootPhase(prev => (prev + 1) % bootPhrases.length);
    }, durationMs / bootPhrases.length);
    
    return () => {
      clearTimeout(closeTimer);
      clearInterval(progressInterval);
      clearInterval(bootInterval);
    };
  }, [isOpen, durationMs, onClose, bootPhrases.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl intro-bg">
      <div className="relative w-[95vw] max-w-4xl aspect-square">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)]"></div>
        
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <defs>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9"/>
              <stop offset="45%" stopColor="#3B82F6" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="stroke-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6"/>
              <stop offset="50%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#EC4899"/>
            </linearGradient>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6"/>
              <stop offset="50%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#EC4899"/>
            </linearGradient>
            <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="noise" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
              <feBlend in="SourceGraphic" in2="noise" mode="overlay" result="noisy"/>
            </filter>
            <mask id="circle-mask">
              <circle cx="300" cy="300" r="250" fill="white" />
            </mask>
          </defs>

          {/* Core glow */}
          <circle cx="300" cy="300" r="200" fill="url(#core-glow)" opacity="0.6"/>

          {/* Animated rings with glow effect */}
          <g filter="url(#glow-effect)">
            <circle className="animate-[spin_12s_linear_infinite]" cx="300" cy="300" r="220" fill="none" stroke="url(#stroke-gradient)" strokeWidth="1.5" strokeDasharray="2 4"/>
            <circle className="animate-[spin_24s_linear_reverse_infinite]" cx="300" cy="300" r="240" fill="none" stroke="url(#stroke-gradient)" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="8 12"/>
            <circle className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" cx="300" cy="300" r="180" fill="none" stroke="#3B82F6" strokeWidth="0.5" strokeOpacity="0.3"/>
          </g>

          {/* Data points and connection lines */}
          <g className="data-nodes">
            {[...Array(24)].map((_, i) => {
              const angle = (i * 15) * Math.PI / 180;
              const radius = 220 + (i % 3) * 20;
              const x = 300 + radius * Math.cos(angle);
              const y = 300 + radius * Math.sin(angle);
              const size = 2 + (i % 5);
              return (
                <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <circle cx={x} cy={y} r={size} fill={i % 3 === 0 ? "#8B5CF6" : i % 3 === 1 ? "#3B82F6" : "#EC4899"} opacity="0.8"/>
                  {i % 4 === 0 && <line x1="300" y1="300" x2={x} y2={y} stroke="url(#stroke-gradient)" strokeWidth="0.5" strokeOpacity="0.3"/>}
                </g>
              );
            })}
          </g>

          {/* Central logo with pulsing effect */}
          <g className="animate-pulse" style={{ animationDuration: "3s" }}>
            <image href="/logo.svg" x="240" y="240" width="120" height="120" opacity="0.9"/>
          </g>

          {/* Boot text */}
          <text x="300" y="420" textAnchor="middle" className="text-2xl font-bold" fill="white" filter="url(#glow-effect)">
            {bootPhrases[bootPhase]}
          </text>

          {/* Progress indicator */}
          <g transform="translate(150, 460)">
            <rect x="0" y="0" width="300" height="8" rx="4" fill="#1E293B" />
            <rect x="0" y="0" width={3 * progress} height="8" rx="4" fill="url(#progress-gradient)" />
            <text x="150" y="25" textAnchor="middle" className="text-xs" fill="#94A3B8">System initialization {Math.round(progress)}%</text>
          </g>

          {/* Scan line effect */}
          <rect width="600" height="4" y={(300 + 250 * Math.sin(Date.now() / 1000)) % 600} fill="rgba(59, 130, 246, 0.3)" mask="url(#circle-mask)"/>
        </svg>
        
        {/* Skip button */}
        <button 
          className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-md text-white/80 hover:text-white hover:bg-indigo-600/50 transition-colors text-sm font-medium flex items-center gap-2"
          onClick={onClose} 
          aria-label="Skip intro"
        >
          Skip
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
} 