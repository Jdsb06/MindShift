import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function TagFilter({ availableTags, selectedTags, onTagToggle, onClearAll }) {
  const { isDark } = useTheme();

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Filter by tags:
        </label>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className={`text-xs ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              selectedTags.includes(tag)
                ? `${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'} shadow-md`
                : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
            } animate-scale-in`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
} 