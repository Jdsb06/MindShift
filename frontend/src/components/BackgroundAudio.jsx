import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function BackgroundAudio({ src = '/audio/ambient-mindshift.mp3' }) {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('mindshift-audio-enabled');
    return saved === 'true';
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('mindshift-audio-volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [showVolume, setShowVolume] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualize, setVisualize] = useState(false);
  const { isDark } = useTheme();

  // Initialize audio and handle state changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    
    a.loop = true;
    a.volume = volume;
    
    // Function to handle play/pause status
    const updatePlayingState = () => setIsPlaying(!a.paused);
    
    a.addEventListener('play', updatePlayingState);
    a.addEventListener('pause', updatePlayingState);
    
    if (enabled) {
      a.play().catch(() => {
        // If autoplay fails (common in browsers), set enabled to false
        setEnabled(false);
        localStorage.setItem('mindshift-audio-enabled', 'false');
      });
    } else {
      a.pause();
    }
    
    // Save preferences to localStorage
    localStorage.setItem('mindshift-audio-enabled', enabled.toString());
    localStorage.setItem('mindshift-audio-volume', volume.toString());
    
    // Handle visibility change (pause when tab is not visible)
    const handleVisibilityChange = () => {
      if (document.hidden && !a.paused) {
        a.pause();
      } else if (!document.hidden && enabled && a.paused) {
        a.play().catch(() => {});
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      a.removeEventListener('play', updatePlayingState);
      a.removeEventListener('pause', updatePlayingState);
    };
  }, [enabled, volume]);

  // Toggle audio visualization
  const toggleVisualize = () => {
    setVisualize(prev => !prev);
  };

  // Generate random sound wave bars for visualization
  const generateBars = () => {
    return Array(8).fill(0).map((_, i) => {
      const height = isPlaying ? 
        Math.floor(Math.random() * 50) + (i % 3 === 0 ? 70 : 30) : 
        40;
      
      return (
        <div 
          key={i}
          className={`w-[2px] bg-indigo-500 rounded-full mx-[2px] transition-all duration-300`}
          style={{ 
            height: `${height}%`,
            animationDuration: `${0.6 + (i * 0.1)}s`,
            opacity: isPlaying ? 0.8 : 0.3
          }}
        ></div>
      );
    });
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Volume control that shows on hover/focus */}
        <div 
          className={`mb-3 p-4 bg-black/80 backdrop-blur-lg rounded-xl border border-indigo-500/20 transition-all duration-300 ${
            showVolume ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95 pointer-events-none'
          }`}
        >
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-300">Volume</span>
              <span className="text-xs font-bold text-indigo-300">{Math.round(volume * 100)}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setVolume(v => Math.max(0, v - 0.1))}
                aria-label="Decrease volume"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
                </svg>
              </button>
              
              <div className="relative w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${volume * 100}%` }}
                ></div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Volume control"
                />
              </div>
              
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setVolume(v => Math.min(1, v + 0.1))}
                aria-label="Increase volume"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
              </button>
            </div>
            
            <div className="pt-1 flex justify-between items-center border-t border-gray-700">
              <button 
                className={`text-xs font-medium ${visualize ? 'text-indigo-400' : 'text-gray-500'} hover:text-indigo-300 transition-colors flex items-center gap-1`}
                onClick={toggleVisualize}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Visualize
              </button>
              
              <div className="text-xs font-medium text-gray-500">
                {enabled ? 'Ambient Audio' : 'Audio Off'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main audio control button */}
        <div 
          className="relative group"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
          onFocus={() => setShowVolume(true)}
          onBlur={() => setShowVolume(false)}
        >
          <div className={`absolute -right-10 top-1/2 -translate-y-1/2 flex h-12 items-center justify-center transition-all duration-300 ${
            visualize && enabled ? 'opacity-100 scale-100' : 'opacity-0 scale-90 w-0'
          }`}>
            <div className="flex items-end h-8 space-x-0 overflow-hidden">
              {isPlaying && visualize && generateBars()}
            </div>
          </div>
          
          <button
            className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
              enabled 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-300/50' 
                : `${isDark ? 'bg-gray-800/80' : 'bg-white/90'} hover:bg-indigo-600 hover:text-white ${isDark ? 'text-gray-300' : 'text-gray-700'} border border-indigo-300/30`
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 backdrop-blur-md`}
            onClick={() => setEnabled(v => !v)}
            aria-label={enabled ? 'Mute background audio' : 'Enable background audio'}
            title={enabled ? 'Sound on' : 'Sound off'}
            aria-pressed={enabled}
          >
            <span className="sr-only">{enabled ? 'Mute background audio' : 'Enable background audio'}</span>
            
            {/* Ripple effect for active audio */}
            {enabled && (
              <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-indigo-500"></span>
            )}
            
            {enabled ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Button label tooltip */}
          <div 
            className={`absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1.5 
              bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-md text-center 
              transition-all duration-300 shadow-lg border border-indigo-500/20 group-hover:opacity-100 group-hover:scale-100 
              ${isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          >
            {isPlaying ? 'Ambient Audio Playing' : 'Audio Paused'}
          </div>
        </div>
      </div>
    </>
  );
} 