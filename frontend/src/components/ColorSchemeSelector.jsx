import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ColorSchemeSelector() {
  const { colorScheme, changeColorScheme, availableColorSchemes, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef(null);

  // Color scheme preview colors
  const schemePreviewColors = {
    [availableColorSchemes.DEFAULT]: ['#8B5CF6', '#22D3EE', '#F472B6'],
    [availableColorSchemes.OCEAN]: ['#0EA5E9', '#06B6D4', '#2563EB'],
    [availableColorSchemes.SUNSET]: ['#F97316', '#EF4444', '#EC4899'],
    [availableColorSchemes.FOREST]: ['#22C55E', '#10B981', '#14B8A6'],
    [availableColorSchemes.LAVENDER]: ['#A855F7', '#8B5CF6', '#EC4899'],
  };

  // Scheme display names
  const schemeNames = {
    [availableColorSchemes.DEFAULT]: 'Default',
    [availableColorSchemes.OCEAN]: 'Ocean Blue',
    [availableColorSchemes.SUNSET]: 'Sunset Glow',
    [availableColorSchemes.FOREST]: 'Forest Calm',
    [availableColorSchemes.LAVENDER]: 'Lavender Dream',
  };

  // Scheme descriptions
  const schemeDescriptions = {
    [availableColorSchemes.DEFAULT]: 'Balanced harmony of colors',
    [availableColorSchemes.OCEAN]: 'Soothing blues for clarity',
    [availableColorSchemes.SUNSET]: 'Warm, energetic vibes',
    [availableColorSchemes.FOREST]: 'Natural, calm environment',
    [availableColorSchemes.LAVENDER]: 'Creative, inspired thinking',
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset animation state
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsChanging(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [colorScheme]);

  // Handle scheme selection
  const handleSchemeChange = (scheme) => {
    setIsChanging(true);
    changeColorScheme(scheme);
    setIsOpen(false);
  };

  // Get current scheme colors for the toggle button
  const currentSchemeColors = schemePreviewColors[colorScheme];

  return (
    <div className="color-scheme-selector relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-indigo-600/50 transition-all duration-300"
        title="Change color scheme"
        aria-label="Change color scheme"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onMouseLeave={() => setSelectedPreview(null)}
      >
        {/* Animation ring for theme change */}
        {isChanging && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{
            background: `linear-gradient(135deg, ${currentSchemeColors[0]} 0%, ${currentSchemeColors[1]} 50%, ${currentSchemeColors[2]} 100%)`
          }}></span>
        )}
        
        {/* Color wheel button */}
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <div className="absolute inset-0" style={{
            background: `conic-gradient(
              ${currentSchemeColors[0]} 0%, 
              ${currentSchemeColors[1]} 33%, 
              ${currentSchemeColors[2]} 66%, 
              ${currentSchemeColors[0]} 100%
            )`,
            animation: isChanging ? 'spin 1s linear' : 'none'
          }}></div>
        </div>
      </button>
      
      {/* Floating tooltip when hovering over button and dropdown is closed */}
      {!isOpen && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1.5 
          bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-md text-center 
          transition-all duration-300 shadow-lg border border-indigo-500/20
          opacity-0 group-hover:opacity-100 pointer-events-none">
          Color Theme: {schemeNames[colorScheme]}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-xl overflow-hidden shadow-lg bg-black/80 backdrop-blur-md border border-gray-700/50 focus:outline-none z-50 animate-scale-in"
          style={{ animationDuration: '0.2s' }}>
          <div className="py-3 px-3">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-medium text-white">Color Experience</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Preview area */}
            <div className="w-full h-24 rounded-lg overflow-hidden mb-3 relative">
              <div className="absolute inset-0 transition-all duration-300" style={{
                background: `linear-gradient(135deg, 
                  ${(selectedPreview ? schemePreviewColors[selectedPreview] : currentSchemeColors)[0]} 0%, 
                  ${(selectedPreview ? schemePreviewColors[selectedPreview] : currentSchemeColors)[1]} 50%, 
                  ${(selectedPreview ? schemePreviewColors[selectedPreview] : currentSchemeColors)[2]} 100%
                )`
              }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium">
                {selectedPreview ? schemeNames[selectedPreview] : schemeNames[colorScheme]}
              </div>
            </div>
            
            <p className="text-xs text-gray-300 mb-3 text-center italic">
              {selectedPreview ? schemeDescriptions[selectedPreview] : schemeDescriptions[colorScheme]}
            </p>
            
            {/* Color options */}
            <div className="grid grid-cols-5 gap-2">
              {Object.values(availableColorSchemes).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => handleSchemeChange(scheme)}
                  onMouseEnter={() => setSelectedPreview(scheme)}
                  onMouseLeave={() => setSelectedPreview(null)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    colorScheme === scheme ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-white/5'
                  }`}
                  aria-label={`Switch to ${schemeNames[scheme]} color scheme`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner">
                    <div className="w-full h-full" style={{
                      background: `linear-gradient(135deg, ${schemePreviewColors[scheme][0]} 0%, ${schemePreviewColors[scheme][1]} 50%, ${schemePreviewColors[scheme][2]} 100%)`
                    }}></div>
                  </div>
                  {colorScheme === scheme && (
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add a utility function to generate a random hex color
export const getRandomColor = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}
