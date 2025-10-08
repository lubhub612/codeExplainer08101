// src/components/LayoutOptions.js
import React, { useState } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import { useTheme } from '../contexts/ThemeContext';
import './LayoutOptions.css';

export const LayoutOptions = () => {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const { layout, changeLayout, sidebarCollapsed, toggleSidebar } = useLayout();
  const { isDarkMode } = useTheme();

  const layoutOptions = [
    {
      id: 'split',
      name: 'Split View',
      icon: '📐',
      description: 'Code and explanations side by side',
      shortcut: 'Alt+1'
    },
    {
      id: 'focus',
      name: 'Focus Mode',
      icon: '🎯',
      description: 'Large code editor with smaller explanations',
      shortcut: 'Alt+2'
    },
    {
      id: 'explanation',
      name: 'Explanation Focus',
      icon: '📖',
      description: 'Large explanations with smaller code editor',
      shortcut: 'Alt+3'
    },
    {
      id: 'fullscreen',
      name: 'Fullscreen Code',
      icon: '🖥️',
      description: 'Code editor takes full width',
      shortcut: 'Alt+4'
    },
    {
      id: 'vertical',
      name: 'Vertical Stack',
      icon: '📱',
      description: 'Code above, explanations below',
      shortcut: 'Alt+5'
    }
  ];

  const handleLayoutChange = (newLayout) => {
    changeLayout(newLayout);
    setShowLayoutMenu(false);
  };

  const getCurrentLayout = () => {
    return layoutOptions.find(opt => opt.id === layout) || layoutOptions[0];
  };

  const currentLayout = getCurrentLayout();

  return (
    <div className={`layout-options ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="layout-controls">
        {/* Sidebar Toggle */}
        <button
          className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span>{sidebarCollapsed ? '↔️' : '↕️'}</span>
        </button>

        {/* Layout Selector */}
        <div className="layout-selector">
          <button
            className="layout-trigger"
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            title="Change Layout"
          >
            <span className="layout-icon">{currentLayout.icon}</span>
            <span className="layout-name">{currentLayout.name}</span>
            <span className="dropdown-arrow">▾</span>
          </button>

          {showLayoutMenu && (
            <div className="layout-menu">
              <div className="layout-menu-header">
                <span>Layout Options</span>
                <button
                  className="close-menu"
                  onClick={() => setShowLayoutMenu(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="layout-options-list">
                {layoutOptions.map(option => (
                  <div
                    key={option.id}
                    className={`layout-option ${layout === option.id ? 'active' : ''}`}
                    onClick={() => handleLayoutChange(option.id)}
                  >
                    <div className="option-icon">{option.icon}</div>
                    <div className="option-info">
                      <div className="option-name">{option.name}</div>
                      <div className="option-description">{option.description}</div>
                    </div>
                    <div className="option-shortcut">{option.shortcut}</div>
                  </div>
                ))}
              </div>

              <div className="layout-tips">
                <div className="tip">
                  <strong>💡 Tip:</strong> Use keyboard shortcuts to quickly switch layouts
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layout Overlay (closes menu when clicking outside) */}
      {showLayoutMenu && (
        <div 
          className="layout-overlay"
          onClick={() => setShowLayoutMenu(false)}
        />
      )}
    </div>
  );
};

export default LayoutOptions;