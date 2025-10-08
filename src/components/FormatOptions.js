// src/components/FormatOptions.js
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import CodeFormatter from '../services/codeFormatter';
import './FormatOptions.css';

export const FormatOptions = ({ 
  code, 
  language, 
  onFormat, 
  onFormatSettingsChange,
  currentSettings = {} 
}) => {
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatSettings, setFormatSettings] = useState({
    indentSize: currentSettings.indentSize || 2,
    useTabs: currentSettings.useTabs || false,
    maxLineLength: currentSettings.maxLineLength || 80,
    preserveBlankLines: currentSettings.preserveBlankLines !== false
  });
  const { isDarkMode } = useTheme();

  const supportedLanguages = CodeFormatter.getSupportedLanguages();

  const handleFormat = () => {
    if (code && code.trim()) {
      const formattedCode = CodeFormatter.formatCode(code, language, formatSettings);
      onFormat(formattedCode);
      setShowFormatMenu(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...formatSettings, [key]: value };
    setFormatSettings(newSettings);
    if (onFormatSettingsChange) {
      onFormatSettingsChange(newSettings);
    }
  };

  const handleQuickFormat = () => {
    handleFormat();
  };

  const validation = CodeFormatter.validateCode(code, language);

  return (
    <div className={`format-options ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="format-controls">
        {/* Quick Format Button */}
        <button
          className="format-button quick-format"
          onClick={handleQuickFormat}
          disabled={!code || !code.trim()}
          title="Quick Format (Ctrl+Shift+F)"
        >
          <span className="format-icon">✨</span>
          <span className="format-text">Format</span>
        </button>

        {/* Format Options Menu */}
        <div className="format-menu-container">
          <button
            className="format-button options-trigger"
            onClick={() => setShowFormatMenu(!showFormatMenu)}
            disabled={!code || !code.trim()}
            title="Formatting Options"
          >
            <span className="options-icon">⚙️</span>
          </button>

          {showFormatMenu && (
            <div className="format-menu">
              <div className="menu-header">
                <h4>Formatting Options</h4>
                <button
                  className="close-menu"
                  onClick={() => setShowFormatMenu(false)}
                >
                  ×
                </button>
              </div>

              <div className="format-settings">
                <div className="setting-group">
                  <label className="setting-label">Indentation</label>
                  <div className="setting-options">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="indentType"
                        checked={!formatSettings.useTabs}
                        onChange={() => handleSettingChange('useTabs', false)}
                      />
                      <span>Spaces</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="indentType"
                        checked={formatSettings.useTabs}
                        onChange={() => handleSettingChange('useTabs', true)}
                      />
                      <span>Tabs</span>
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    Indent Size: {formatSettings.indentSize}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={formatSettings.indentSize}
                    onChange={(e) => handleSettingChange('indentSize', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    Max Line Length: {formatSettings.maxLineLength}
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={formatSettings.maxLineLength}
                    onChange={(e) => handleSettingChange('maxLineLength', parseInt(e.target.value))}
                    className="slider"
                  />
                </div>

                <div className="setting-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formatSettings.preserveBlankLines}
                      onChange={(e) => handleSettingChange('preserveBlankLines', e.target.checked)}
                    />
                    <span>Preserve blank lines</span>
                  </label>
                </div>
              </div>

              <div className="validation-info">
                {!validation.isValid && (
                  <div className="validation-warning">
                    <span className="warning-icon">⚠️</span>
                    <span>Code has formatting issues</span>
                  </div>
                )}
                <div className="language-info">
                  Formatting for: <strong>{language}</strong>
                </div>
              </div>

              <div className="menu-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowFormatMenu(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleFormat}
                >
                  Apply Formatting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Validation Badge */}
      {code && code.trim() && (
        <div className="validation-badge">
          {validation.isValid ? (
            <span className="badge valid">✅ Valid {language}</span>
          ) : (
            <span className="badge invalid">
              ⚠️ {validation.issues.length} issue{validation.issues.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}

      {/* Overlay for closing menu */}
      {showFormatMenu && (
        <div 
          className="format-overlay"
          onClick={() => setShowFormatMenu(false)}
        />
      )}
    </div>
  );
};

export default FormatOptions;