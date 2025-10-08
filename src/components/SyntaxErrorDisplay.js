// src/components/SyntaxErrorDisplay.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './SyntaxErrorDisplay.css';

export const SyntaxErrorDisplay = ({ errors, warnings, onErrorClick, language }) => {
  const { isDarkMode } = useTheme();

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleErrorClick = (error) => {
    if (onErrorClick && error.line > 0) {
      onErrorClick(error.line, error.column);
    }
  };

  return (
    <div className={`syntax-error-display ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="error-header">
        <h3>🔍 Syntax Analysis</h3>
        <div className="error-summary">
          {errors.length > 0 && (
            <span className="error-count" style={{ color: '#ef4444' }}>
              {errors.length} error{errors.length === 1 ? '' : 's'}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="warning-count" style={{ color: '#f59e0b' }}>
              {warnings.length} warning{warnings.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      <div className="error-list">
        {errors.map((error, index) => (
          <div
            key={`error-${index}`}
            className="error-item error"
            onClick={() => handleErrorClick(error)}
            style={{ cursor: error.line > 0 ? 'pointer' : 'default' }}
          >
            <div className="error-icon" style={{ color: getSeverityColor(error.severity) }}>
              {getSeverityIcon(error.severity)}
            </div>
            <div className="error-content">
              <div className="error-message">
                {error.message}
                {error.line > 0 && (
                  <span className="error-location">
                    (line {error.line}, col {error.column})
                  </span>
                )}
              </div>
              <div className="error-suggestion">{error.suggestion}</div>
              <div className="error-type">{error.type}</div>
            </div>
          </div>
        ))}

        {warnings.map((warning, index) => (
          <div
            key={`warning-${index}`}
            className="error-item warning"
            onClick={() => handleErrorClick(warning)}
            style={{ cursor: warning.line > 0 ? 'pointer' : 'default' }}
          >
            <div className="error-icon" style={{ color: getSeverityColor(warning.severity) }}>
              {getSeverityIcon(warning.severity)}
            </div>
            <div className="error-content">
              <div className="error-message">
                {warning.message}
                {warning.line > 0 && (
                  <span className="error-location">
                    (line {warning.line}, col {warning.column})
                  </span>
                )}
              </div>
              <div className="error-suggestion">{warning.suggestion}</div>
              <div className="error-type">{warning.type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyntaxErrorDisplay;