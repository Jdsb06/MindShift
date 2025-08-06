import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SUGGESTED_TAGS = [
  '#work', '#health', '#learning', '#social', '#creative', 
  '#fitness', '#mindfulness', '#family', '#finance', '#hobby'
];

export default function TagSelector({ selectedTags = [], onTagsChange, placeholder = "Add tags..." }) {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState(SUGGESTED_TAGS);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue) {
      const filtered = SUGGESTED_TAGS.filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredTags(SUGGESTED_TAGS.filter(tag => !selectedTags.includes(tag)));
      setShowSuggestions(false);
    }
  }, [inputValue, selectedTags]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const addTag = (tag) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!selectedTags.includes(formattedTag) && formattedTag.length > 1) {
      onTagsChange([...selectedTags, formattedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionClick = (tag) => {
    addTag(tag);
  };

  const handleInputFocus = () => {
    if (inputValue) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className={`flex flex-wrap gap-2 p-2 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-300'} rounded-lg min-h-[2.5rem]`}>
        {selectedTags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'} animate-scale-in`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-opacity-80 rounded-full w-4 h-4 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          className={`flex-1 min-w-0 bg-transparent outline-none text-sm ${isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
        />
      </div>
      
      {showSuggestions && filteredTags.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-1 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto animate-scale-in`}>
          {filteredTags.map((tag, index) => (
            <button
              key={tag}
              onClick={() => handleSuggestionClick(tag)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-opacity-80 transition-colors ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 