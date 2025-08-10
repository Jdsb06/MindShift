import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Available color schemes
export const COLOR_SCHEMES = {
  DEFAULT: 'default',
  OCEAN: 'ocean',
  SUNSET: 'sunset',
  FOREST: 'forest',
  LAVENDER: 'lavender',
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('mindshift-theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [colorScheme, setColorScheme] = useState(() => {
    // Check localStorage for saved color scheme
    const savedScheme = localStorage.getItem('mindshift-color-scheme');
    return savedScheme || COLOR_SCHEMES.DEFAULT;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('mindshift-theme', isDark ? 'dark' : 'light');

    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);

    // Remove all color scheme classes
    Object.values(COLOR_SCHEMES).forEach(scheme => {
      document.documentElement.classList.remove(`color-scheme-${scheme}`);
    });

    // Apply current color scheme
    document.documentElement.classList.add(`color-scheme-${colorScheme}`);
  }, [isDark, colorScheme]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const changeColorScheme = (scheme) => {
    if (Object.values(COLOR_SCHEMES).includes(scheme)) {
      setColorScheme(scheme);
      localStorage.setItem('mindshift-color-scheme', scheme);
    }
  };

  const value = {
    isDark,
    toggleTheme,
    theme: isDark ? 'dark' : 'light',
    colorScheme,
    changeColorScheme,
    availableColorSchemes: COLOR_SCHEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
