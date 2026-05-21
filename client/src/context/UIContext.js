import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    document.body.className = `${theme}-mode`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (event.key === 'Escape') setIsCommandOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    isCommandOpen,
    openCommandPalette: () => setIsCommandOpen(true),
    closeCommandPalette: () => setIsCommandOpen(false),
  }), [theme, toggleTheme, isCommandOpen]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
