import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const INTENTIONS = ['Clarity', 'Calm', 'Focus', 'Presence', 'Momentum'];

export default function IntentionPrompt() {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState(null);

  return (
    <section className="px-6 py-16 max-w-4xl mx-auto text-center">
      <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl font-semibold mb-2`}>Choose your intention for today</h3>
      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>We’ll meet you there.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {INTENTIONS.map(word => {
          const selectedClasses = isDark
            ? 'bg-white/10 text-white border-white/20'
            : 'bg-blue-50 text-blue-700 border-blue-200';
          const baseClasses = isDark
            ? 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
          return (
            <button
              key={word}
              className={`px-4 py-2 rounded-full border transition-colors ${selected === word ? selectedClasses : baseClasses}`}
              onClick={() => setSelected(word)}
            >
              {word}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`mt-6 animate-fade-in ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{selected}</span> it is. Tiny steps. Gentle progress.
        </div>
      )}
    </section>
  );
} 