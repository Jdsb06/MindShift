import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function GoalLinker({ compassGoals, selectedGoal, onGoalSelect, onGoalClick }) {
  const { isDark } = useTheme();

  const goalIcons = ['🎯', '🌟', '💫'];

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        Link to a goal (optional):
      </label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(compassGoals).map(([key, goal], index) => (
          <button
            key={key}
            onClick={() => onGoalSelect(selectedGoal === goal ? null : goal)}
            onDoubleClick={() => onGoalClick && onGoalClick(goal, key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedGoal === goal
                ? `${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'} shadow-md`
                : `${isDark ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`
            } animate-scale-in relative group`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="text-lg">{goalIcons[index]}</span>
            <span className="truncate max-w-32">{goal}</span>
            {selectedGoal === goal && (
              <span className="text-xs">✓</span>
            )}
            <div className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full ${
              isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
            } w-5 h-5 flex items-center justify-center text-xs`} title="View goal journey">
              👁️
            </div>
          </button>
        ))}
      </div>
      {onGoalClick && (
        <div className={`mt-1 text-xs ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          <span>Double-click a goal to view its journey</span>
        </div>
      )}
    </div>
  );
}
