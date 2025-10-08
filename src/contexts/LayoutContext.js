// src/contexts/LayoutContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState(() => {
    // Get saved layout from localStorage or default to 'split'
    return localStorage.getItem('codeExplainerLayout') || 'split';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelSizes, setPanelSizes] = useState({
    editor: 50,
    explanation: 50
  });

  useEffect(() => {
    // Save layout preference to localStorage
    localStorage.setItem('codeExplainerLayout', layout);
  }, [layout]);

  const changeLayout = (newLayout) => {
    setLayout(newLayout);
    
    // Reset panel sizes when changing layout
    if (newLayout === 'split') {
      setPanelSizes({ editor: 50, explanation: 50 });
    } else if (newLayout === 'focus') {
      setPanelSizes({ editor: 70, explanation: 30 });
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const updatePanelSizes = (sizes) => {
    setPanelSizes(sizes);
  };

  const value = {
    layout,
    sidebarCollapsed,
    panelSizes,
    changeLayout,
    toggleSidebar,
    updatePanelSizes
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};