import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function TagFilter({ availableTags, selectedTags, onTagToggle, onClearAll }) {
  const { isDark, colorScheme } = useTheme();
  const [hoveredTag, setHoveredTag] = useState(null);
  
  if (availableTags.length === 0) {
    return null;
  }
  
  // Get color scheme based on current theme
  const getTagColors = (isSelected) => {
    if (isSelected) {
      switch(colorScheme) {
        case 'ocean':
          return isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800';
        case 'sunset':
          return isDark ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800';
        case 'forest':
          return isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800';
        case 'lavender':
          return isDark ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-800';
        default:
          return isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800';
      }
    } else {
      return isDark 
        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
        : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Get glow effect for selected tags
  const getGlowEffect = () => {
    switch(colorScheme) {
      case 'ocean':
        return isDark ? 'shadow-blue-500/30' : 'shadow-blue-300/30';
      case 'sunset':
        return isDark ? 'shadow-amber-500/30' : 'shadow-amber-300/30';
      case 'forest':
        return isDark ? 'shadow-emerald-500/30' : 'shadow-emerald-300/30';
      case 'lavender':
        return isDark ? 'shadow-violet-500/30' : 'shadow-violet-300/30';
      default:
        return isDark ? 'shadow-indigo-500/30' : 'shadow-indigo-300/30';
    }
  };

  return (
    <div className={`space-y-3 p-4 rounded-xl ${
      isDark ? 'bg-gray-800/30 backdrop-blur-sm' : 'bg-white/30 backdrop-blur-sm'
    } border ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
      <div className="flex items-center justify-between">
        <label className={`text-sm font-medium flex items-center ${
          isDark ? 'text-gray-100' : 'text-gray-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          Filter by tags
        </label>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className={`text-xs px-2 py-1 rounded-md transition-all duration-200 flex items-center
              ${isDark 
                ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white' 
                : 'bg-gray-200/50 hover:bg-gray-200 text-gray-600 hover:text-gray-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isHovered = hoveredTag === tag;
          
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              onMouseEnter={() => setHoveredTag(tag)}
              onMouseLeave={() => setHoveredTag(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300
                ${getTagColors(isSelected)}
                ${isSelected 
                  ? `shadow-md ${getGlowEffect()} transform ${isHovered ? 'scale-110' : 'scale-105'}` 
                  : 'hover:scale-105'
                }
                ${isSelected && isHovered ? 'ring-1 ring-white/20' : ''}
                animate-scale-in relative overflow-hidden`}
              style={{
                animationDelay: `${availableTags.indexOf(tag) * 50}ms`
              }}
            >
              {/* Background glow effect for selected tags */}
              {isSelected && (
                <span className={`absolute inset-0 ${
                  isDark ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
                } ${isHovered ? 'animate-shine' : ''}`}></span>
              )}
              
              <span className="relative z-10 flex items-center">
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {tag}
              </span>
            </button>
          );
        })}
        
        {/* Add more tags hint if needed */}
        {availableTags.length < 2 && (
          <div className={`text-xs px-3 py-1.5 rounded-full border border-dashed
            ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}
          >
            Add more tags to filter
          </div>
        )}
      </div>
    </div>
  );
}
