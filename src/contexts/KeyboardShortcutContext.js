// src/contexts/KeyboardShortcutContext.js
import React, { createContext, useContext, useEffect, useCallback } from 'react';

const KeyboardShortcutContext = createContext();

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
};

export const KeyboardShortcutProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = React.useState([]);

  const registerShortcut = useCallback((key, callback, description) => {
    setShortcuts(prev => [...prev, { key, callback, description }]);
  }, []);

  const unregisterShortcut = useCallback((key) => {
    setShortcuts(prev => prev.filter(shortcut => shortcut.key !== key));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrlKey = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
      const shiftKey = event.shiftKey;
      const altKey = event.altKey;

      // Build shortcut string
      let shortcutString = '';
      if (ctrlKey) shortcutString += 'ctrl+';
      if (altKey) shortcutString += 'alt+';
      if (shiftKey) shortcutString += 'shift+';
      shortcutString += key;

      // Find and execute matching shortcut
      const matchingShortcut = shortcuts.find(s => s.key === shortcutString);
      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  const value = {
    registerShortcut,
    unregisterShortcut,
    shortcuts
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
};