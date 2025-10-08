// src/App.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import languageDetector from './services/languageDetection';
import { useTheme } from './contexts/ThemeContext';
import { useKeyboardShortcuts } from './contexts/KeyboardShortcutContext';
import { CodeExamplesLibrary } from './components/CodeExamplesLibrary';
import { ExportOptions } from './components/ExportOptions';
import { CustomHighlightedCodeBlock } from './components/CustomHighlightedCodeBlock';
import CustomSyntaxHighlighter from './services/customSyntaxHighlighter';
import { CodeAnalysisMetrics } from './components/CodeAnalysisMetrics';
import CodeAnalysis from './services/codeAnalysis';
import SyntaxErrorDetector from './services/syntaxErrorDetector';
import { SyntaxErrorDisplay } from './components/SyntaxErrorDisplay';
import { FormatOptions } from './components/FormatOptions';
import CodeFormatter from './services/codeFormatter';
import './styles/App.css';
import './styles/CodeInput.css';
import './styles/CodeExplanation.css';
import './styles/Components.css';

export const CodeInput = ({ code, onCodeChange, onExplain,
   isLoading, textareaRef, fileInputRef,
    onClear,  onShowExamples, onFileUpload,
    filename, currentLanguage, onLanguageChange, 
    onShowAnalysis
 }) => {
  const [language, setLanguage] = useState(currentLanguage || 'auto');
  const [detectedLanguage, setDetectedLanguage] = useState('auto');
 // const [filename, setFilename] = useState('');
  const [lineCount, setLineCount] = useState(1);
  const [showHighlighted, setShowHighlighted] = useState(true);
  const [syntaxErrors, setSyntaxErrors] = useState({ errors: [], warnings: [], isValid: true });
  const [showErrors, setShowErrors] = useState(true);
  const [syntaxStatus, setSyntaxStatus] = useState({ isValid: true, errorCount: 0, warningCount: 0 });
   const [formatSettings, setFormatSettings] = useState({
    indentSize: 2,
    useTabs: false,
    maxLineLength: 80,
    preserveBlankLines: true
  });
  //const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
 // const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const lines = code.split('\n');
    const count = lines.length > 0 ? lines.length : 1;
    setLineCount(count);

    // Auto-detect language when code changes
    if (code.trim()) {
      const detected = languageDetector.detectLanguage(code, filename);
      setDetectedLanguage(detected);
      
      // Only auto-switch if language is set to auto-detect
      if (language === 'auto') {
        setLanguage(detected);
        if (onLanguageChange) {
          onLanguageChange(detected);
        }
      }
    } else {
      setDetectedLanguage('auto');
      if (language !== 'auto') {
        setLanguage('auto');
        if (onLanguageChange) {
          onLanguageChange('auto');
        }
      }
    }
  }, [code, filename, language, onLanguageChange]);

  useEffect(() => {
    if (code.trim()) {
      const detectionResult = SyntaxErrorDetector.detectErrors(code, currentLanguage);
      setSyntaxErrors(detectionResult);
      setSyntaxStatus({
        isValid: detectionResult.isValid,
        errorCount: detectionResult.errors.length,
        warningCount: detectionResult.warnings.length
      })
    } else {
      setSyntaxErrors({ errors: [], warnings: [], isValid: true });
      setSyntaxStatus({ isValid: true, errorCount: 0, warningCount: 0 });
    }
  }, [code, currentLanguage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onExplain(code);
  };

  const handleClear = () => {
  /*  onCodeChange('');
    setFilename('');
    setDetectedLanguage('auto');
    setLanguage('auto');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }*/
    onClear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onCodeChange(newCode);
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

   // setFilename(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
if (onFileUpload) {
        onFileUpload(file, fileContent);
      } else {
        onCodeChange(fileContent);
      }
      //onCodeChange(fileContent);
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };


  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const handleErrorClick = (line, column) => {
    if (textareaRef.current) {
      const lines = code.split('\n');
      let position = 0;
      
      // Calculate position in text
      for (let i = 0; i < line - 1; i++) {
        position += lines[i].length + 1; // +1 for newline
      }
      position += column - 1;
      
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, position);
      
      // Scroll to the error line
      const lineHeight = 20; // Approximate line height
      textareaRef.current.scrollTop = (line - 1) * lineHeight;
    }
  };

  const handleFormat = (formattedCode) => {
    onCodeChange(formattedCode);
    
    // Show success feedback
    if (formattedCode !== code) {
      // You could add a toast notification here
      console.log('Code formatted successfully');
    }
  };

  const handleFormatSettingsChange = (newSettings) => {
    setFormatSettings(newSettings);
  };

  const getDisplayLanguage = () => {
    if (language === 'auto' && detectedLanguage !== 'auto') {
      return {
        name: CustomSyntaxHighlighter.getLanguageName(detectedLanguage),
        icon: CustomSyntaxHighlighter.getLanguageIcon(detectedLanguage)
      };
    }
    if (language === 'auto') {
      return { name: 'Auto-detect', icon: '🔍' };
    }
    return {
      name: CustomSyntaxHighlighter.getLanguageName(language),
      icon: CustomSyntaxHighlighter.getLanguageIcon(language)
    };
   /* if (language === 'auto' && detectedLanguage !== 'auto') {
      return languageDetector.getLanguageInfo(detectedLanguage);
    }
    return languageDetector.getLanguageInfo(language);*/
  };

  

  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);
  const displayLangInfo = getDisplayLanguage();
    const effectiveLanguage = language === 'auto' ? detectedLanguage : language;

  return (
    <div className={`code-input-container ${isDarkMode ? 'dark' : 'light'}`}>
      <form onSubmit={handleSubmit} className="code-form">
        <div className="form-header">
          <h2>Enter Your Code</h2>
          <div className="button-group">
            <FormatOptions
              code={code}
              language={currentLanguage}
              onFormat={handleFormat}
              onFormatSettingsChange={handleFormatSettingsChange}
              currentSettings={formatSettings}
            />
            <button 
              type="button" 
              onClick={() => setShowErrors(!showErrors)}
              className="btn btn-secondary"
              disabled={isLoading || syntaxErrors.errors.length === 0}
              title="Toggle error display"
            >
              <span>{showErrors ? '👁️' : '👁️‍🗨️'}</span>
              {showErrors ? 'Hide Errors' : 'Show Errors'}
            </button>
            <button 
              type="button" 
              onClick={onShowAnalysis}
              className="btn btn-analysis"
              disabled={isLoading || !code.trim()}
              title="Analyze Code Metrics"
            >
              <span>📊</span>
                Analyze
            </button>
            <button 
              type="button" 
              onClick={onShowExamples}
              className="btn btn-examples"
              disabled={isLoading}
              title="Browse Code Examples (Ctrl+E)"
            >
              <span>📚</span>
              Examples
            </button>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <span>📁</span>
              Upload File
            </button>
            <button 
              type="button" 
              onClick={() => setShowHighlighted(!showHighlighted)}
              className="btn btn-secondary"
              disabled={isLoading}
              title={showHighlighted ? 'Switch to plain text' : 'Switch to syntax highlighting'}
            >
              <span>{showHighlighted ? '📝' : '🎨'}</span>
              {showHighlighted ? 'Plain Text' : 'Syntax Highlight'}
            </button>
            <button 
              type="button" 
              onClick={handleClear}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <span>🗑️</span>
              Clear
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !code.trim() || syntaxStatus.errorCount > 0}
              className="btn btn-primary"
              title={syntaxStatus.errorCount > 0 ? 'Fix syntax errors before explaining' : 'Explain the code'}
            >
              {isLoading ? (
                <>
                  <span className="loading-dots">⚡</span>
                  Explaining...
                </>
              ) : syntaxStatus.errorCount > 0 ? (
                <>
                   <span>❌</span>
                    Fix Errors First
                </>
              ) : (
                <>
                  <span>🤖</span>
                  Explain Code
                </>
              )}
            </button>
          </div>
        </div>

        {code.trim() && (
          <div className="error-summary-badge">
            {syntaxErrors.isValid ? (
              <span className="badge valid">✅ No syntax errors</span>
            ) : (
              <span className="badge invalid">
                ❌ {syntaxErrors.errors.length} error{syntaxErrors.errors.length === 1 ? '' : 's'}
                {syntaxErrors.warnings.length > 0 && 
                  `, ⚠️ ${syntaxErrors.warnings.length} warning${syntaxErrors.warnings.length === 1 ? '' : 's'}`
                }
              </span>
            )}
          </div>
        )}
        
        <div className="code-editor-container">
          <div className="editor-header">
            <div className="language-selector">
              <select 
                value={language} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="language-dropdown"
                disabled={isLoading}
              >
                <option value="auto">🔍 Auto-detect</option>
                {CustomSyntaxHighlighter.getAllSupportedLanguages().map(lang => (
                  <option key={lang} value={lang}>
                    {CustomSyntaxHighlighter.getLanguageIcon(lang)} {CustomSyntaxHighlighter.getLanguageName(lang)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="detection-info">
              {detectedLanguage !== 'auto' && language === 'auto' && (
                <span className="detected-badge">
                  🔍 Detected: {CustomSyntaxHighlighter.getLanguageName(detectedLanguage)}
                </span>
              )}
              {filename && (
                <span className="filename-badge">
                  📄 {filename}
                </span>
              )}
              <span className="highlight-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={showHighlighted}
                    onChange={(e) => setShowHighlighted(e.target.checked)}
                    disabled={isLoading}
                  />
                  Syntax Highlighting
                </label>
              </span>
            </div>
          </div>
          
          {showHighlighted && code ? (
            <div className="highlighted-editor-wrapper">
              <CustomHighlightedCodeBlock
                code={code}
                language={effectiveLanguage}
                lineNumbers={true}
                showCopyButton={false}
                maxHeight="400px"
                editable={true}
                onChange={onCodeChange}
              />
            </div>
          ) : (
          <div className="code-editor-wrapper">
            <div 
              ref={lineNumbersRef}
              className="line-numbers"
              onClick={handleTextareaClick}
            >
              {lines.map(line => (
                <div 
                  key={line} 
                  className="line-number"
                  data-line={line}
                >
                  {line}
                </div>
              ))}
            </div>
            
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              onClick={handleTextareaClick}
              placeholder={`// Paste your code here or upload a file...\n// Language: ${displayLangInfo.name}\n// Supported: JavaScript, Python, Java, C++, HTML, CSS, PHP, Ruby, Go, Rust`}
              className="code-textarea"
              rows={15}
              disabled={isLoading}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          )}
        </div>
        
        <div className="form-footer">
          <div className="stats">
            <div className="stat">
              <span>📊</span>
              <span>{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="stat">
              <span>📝</span>
              <span>{code.length} characters</span>
            </div>
            <div className="stat">
              <span>{displayLangInfo.icon}</span>
              <span>{displayLangInfo.name}</span>
            </div>
            {code.trim() && (
              <div className="stat">
                <span>⚡</span>
                <span>{code.split('\n').filter(line => line.trim()).length} code lines</span>
              </div>
            )}
          </div>
          <span className="hint">
            💡 Tip: Toggle syntax highlighting for better code readability. Supports {CustomSyntaxHighlighter.getAllSupportedLanguages().length}+ languages.
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept={CustomSyntaxHighlighter.getAllSupportedLanguages().map(lang => `.${lang}`).join(',') + ',.txt,.md,.json,.yml,.yaml,.xml'}
          style={{ display: 'none' }}
        />
        {showErrors && code.trim() && (
          <SyntaxErrorDisplay
            errors={syntaxErrors.errors}
            warnings={syntaxErrors.warnings}
            onErrorClick={handleErrorClick}
            language={currentLanguage}
          />
        )}
      </form>
    </div>
  );
};

export const CodeExplanation = ({ explanations }) => {
  const [expandedAll, setExpandedAll] = useState(true);
  const [showOnlyCode, setShowOnlyCode] = useState(false);
  const { isDarkMode } = useTheme();
  
  // Refs for synchronized scrolling
  const lineNumbersRef = useRef(null);
  const contentRef = useRef(null);

  const toggleAllExplanations = () => {
    setExpandedAll(!expandedAll);
  };

  const toggleCodeOnly = () => {
    setShowOnlyCode(!showOnlyCode);
  };

  // Handle synchronized scrolling between line numbers and content
  const handleContentScroll = useCallback((e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  // Initialize scroll synchronization
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleContentScroll);
      return () => {
        contentElement.removeEventListener('scroll', handleContentScroll);
      };
    }
  }, [handleContentScroll]);

  const nonEmptyLines = explanations.filter(item => item.code.trim() !== '');
  const totalLines = explanations.length;
  const codeLines = nonEmptyLines.length;
  const emptyLines = totalLines - codeLines;

  return (
    <div className={`code-explanation-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="explanation-header">
        <div className="header-main">
          <h2>Line-by-Line Explanation</h2>
          <span className="total-lines">
            {totalLines} line{totalLines !== 1 ? 's' : ''} • {codeLines} code • {emptyLines} empty
          </span>
        </div>
        
        <div className="header-controls">
          <button 
            onClick={toggleCodeOnly}
            className={`btn btn-control ${showOnlyCode ? 'active' : ''}`}
            title="Toggle code-only view"
          >
            <span>{showOnlyCode ? '📖' : '📝'}</span>
            {showOnlyCode ? 'Show Explanations' : 'Code Only'}
          </button>
          
          <button 
            onClick={toggleAllExplanations}
            className={`btn btn-control ${expandedAll ? 'active' : ''}`}
            title="Expand/Collapse all explanations"
          >
            <span>{expandedAll ? '📂' : '📁'}</span>
            {expandedAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>
      
      <div className="explanation-content-wrapper">
        <div 
          ref={lineNumbersRef}
          className="line-numbers-output"
        >
          {explanations.map((item, index) => (
            <div 
              key={index} 
              className="line-number-output"
              data-line-number={item.lineNumber}
            >
              {item.lineNumber}
            </div>
          ))}
        </div>
        
        <div 
          ref={contentRef}
          className="code-and-explanations"
          style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            overflowX: 'auto'
          }}
        >
          {explanations.map((item, index) => (
            <LineExplanation
              key={index}
              lineNumber={item.lineNumber}
              code={item.code}
              explanation={item.explanation}
              isEven={index % 2 === 0}
              defaultExpanded={expandedAll}
              showExplanation={!showOnlyCode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const LineExplanation = ({ 
  lineNumber, 
  code, 
  explanation, 
  isEven, 
  defaultExpanded = true,
  showExplanation = true,
  language = 'javascript'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { isDarkMode } = useTheme();
  const isEmptyLine = code.trim() === '';

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const toggleExpansion = () => {
    if (!isEmptyLine) {
      setIsExpanded(!isExpanded);
    }
  };

  const getLineType = () => {
    if (isEmptyLine) return 'empty';
    const trimmedCode = code.trim();
    if (trimmedCode.startsWith('//') || trimmedCode.startsWith('/*') || 
        trimmedCode.startsWith('*') || trimmedCode.startsWith('#') ||
        trimmedCode.startsWith('--')) return 'comment';
    if (trimmedCode.includes('function') || trimmedCode.includes('def ') || 
        trimmedCode.includes('class ') || trimmedCode.match(/^\s*(public|private|protected)\s+/)) return 'definition';
    if (trimmedCode.includes('if') || trimmedCode.includes('for') || 
        trimmedCode.includes('while') || trimmedCode.includes('switch')) return 'control';
    return 'code';
  };

  const lineType = getLineType();
  const lineTypeIcons = {
    empty: '⚪',
    comment: '💬',
    definition: '🔧',
    control: '🔄',
    code: '📄'
  };

  return (
    <div className={`line-output ${isDarkMode ? 'dark' : 'light'} ${isEven ? 'even' : 'odd'} ${isEmptyLine ? 'empty-line' : ''} ${lineType} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div 
        className={`line-output-header ${!isEmptyLine ? 'clickable' : ''}`}
        onClick={toggleExpansion}
      >
        <div className="line-type-indicator">
          <span className="line-type-icon">
            {lineTypeIcons[lineType]}
          </span>
        </div>
        
        <div className="code-line-output">
          <code className={`language-${lineType}`}>
            {code || ' '}
          </code>
        </div>

        <div className="code-line-output">
          {isEmptyLine ? (
            <code className="empty-code"> </code>
          ) : (
            <CustomHighlightedCodeInline
              code={code}
              language={language}
              lineType={lineType}
            />
          )}
        </div>
        
        {!isEmptyLine && (
          <div className="line-actions">
            <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        )}
      </div>
      
      {showExplanation && !isEmptyLine && isExpanded && explanation && (
        <div className="explanation-panel">
          <div className="explanation-header">
            <span className="explanation-label">
              💡 Explanation
            </span>
            <span className="line-reference">
              Line {lineNumber}
            </span>
          </div>
          <div className="explanation-content">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};


// Helper component for inline code highlighting
const CustomHighlightedCodeInline = ({ code, language, lineType }) => {
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    const highlighted = CustomSyntaxHighlighter.highlight(code, language);
    setHighlightedCode(highlighted);
  }, [code, language]);

  return (
    <code 
      className={`inline-code language-${language} line-type-${lineType}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};

const lineTypeIcons = {
  empty: '⚪',
  comment: '💬',
  definition: '🔧',
  control: '🔄',
  code: '📄'
};

export const Loader = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`loader-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="loader">
        <div className="loader-spinner"></div>
        <p>AI is analyzing your code...</p>
      </div>
    </div>
  );
};

// Theme Toggle Component
export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span className="theme-icon">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span className="theme-text">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

const App = () => {
  const [code, setCode] = useState('');
  const [explanations, setExplanations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('auto');
  const [filename, setFilename] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [formatSettings, setFormatSettings] = useState({
    indentSize: 2,
    useTabs: false,
    maxLineLength: 80,
    preserveBlankLines: true
  });
  const { isDarkMode } = useTheme();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Register keyboard shortcuts
  useEffect(() => {
    // Ctrl/Cmd + Enter: Explain code
    registerShortcut('ctrl+enter', () => {
      if (code.trim() && !isLoading) {
        handleExplainCode(code);
      }
    }, 'Explain the current code');

    // Ctrl/Cmd + S: Focus code input
    registerShortcut('ctrl+s', () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 'Focus code editor');

    // Ctrl/Cmd + K: Clear code
    registerShortcut('ctrl+k', () => {
      handleClearCode();
    }, 'Clear code editor');

    // Ctrl/Cmd + O: Upload file
    registerShortcut('ctrl+o', () => {
      if (fileInputRef.current && !isLoading) {
        fileInputRef.current.click();
      }
    }, 'Upload code file');

    // Ctrl/Cmd + ?: Show shortcuts
    registerShortcut('ctrl+?', () => {
      setShowShortcuts(prev => !prev);
    }, 'Show keyboard shortcuts');

    // Escape: Close shortcuts modal or clear error
    registerShortcut('escape', () => {
      setShowShortcuts(false);
      setError('');
    }, 'Close modal or clear error');

    // Ctrl/Cmd + E: Show examples library
    registerShortcut('ctrl+e', () => {
      setShowExamples(true);
    }, 'Open code examples library');

    // Ctrl/Cmd + Shift + E: Export explanations
    registerShortcut('ctrl+shift+e', () => {
      if (explanations.length > 0) {
        setShowExport(true);
      }
    }, 'Export code explanations');

    // Ctrl/Cmd + Shift + A: Show code analysis
    registerShortcut('ctrl+shift+a', () => {
      if (code.trim()) {
        setShowAnalysis(true);
      }
    }, 'Show code analysis metrics');

    registerShortcut('ctrl+shift+f', () => {
    if (code.trim()) {
      const formatted = CodeFormatter.formatCode(code, currentLanguage, formatSettings);
      setCode(formatted);
    }
  }, 'Format code');

    // Cleanup shortcuts on unmount
    return () => {
      unregisterShortcut('ctrl+enter');
      unregisterShortcut('ctrl+s');
      unregisterShortcut('ctrl+k');
      unregisterShortcut('ctrl+o');
      unregisterShortcut('ctrl+?');
      unregisterShortcut('escape');
      unregisterShortcut('ctrl+e');
      unregisterShortcut('ctrl+shift+e');
      unregisterShortcut('ctrl+shift+a');
      unregisterShortcut('ctrl+shift+f');
    };
  }, [registerShortcut, unregisterShortcut, code, isLoading, explanations, currentLanguage, formatSettings]);

  const handleExplainCode = async (codeToExplain) => {
    if (!codeToExplain.trim()) {
      setError('Please enter some code to explain');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const detectedLanguage = languageDetector.detectLanguage(codeToExplain);
      const mockExplanations = await simulateAIExplanation(codeToExplain, detectedLanguage);
      setExplanations(mockExplanations);
    } catch (err) {
      setError('Failed to generate explanations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCode = () => {
    setCode('');
    setExplanations([]);
    setError('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

const handleExampleSelect = (exampleCode, language) => {
    setCode(exampleCode);
    setExplanations([]);
    setError('');
    
    // Auto-detect and set language
    const detectedLang = languageDetector.detectLanguage(exampleCode);
    if (detectedLang !== 'auto') {
      // You might want to set the language in your CodeInput component
      // This would require passing the language state up or using context
    }
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (file, fileContent) => {
    setFilename(file.name);
    setCode(fileContent);
    
    // Auto-detect language from filename
    const detectedLang = languageDetector.detectLanguage(fileContent, file.name);
    setCurrentLanguage(detectedLang);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs'
    };
    return extensions[lang] || 'txt';
  };

  const simulateAIExplanation = async (code) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const lines = code.split('\n');
    return lines.map((line, index) => ({
      lineNumber: index + 1,
      code: line,
      explanation: generateMockExplanation(line, index)
    }));
  };

  const generateMockExplanation = (line, index) => {
    const explanations = [
      "This line imports the React library",
      "This defines a functional component",
      "This line declares a state variable",
      "This is a function declaration",
      "This handles user input events",
      "This line returns JSX for rendering",
      "This is a conditional rendering statement",
      "This maps over an array of items",
      "This is an event handler function",
      "This updates the component state"
    ];
    return explanations[index % explanations.length] || "This line performs an important operation";
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🤖 Code Explainer</h1>
            <p>Paste your code and get AI-powered line-by-line explanations</p>
          </div>
          <div className="header-actions">
            {code.trim() && (
               <button 
                  className={`btn btn-analysis ${isDarkMode ? 'dark' : 'light'}`}
                  onClick={() => setShowAnalysis(true)}
                  title="Code Analysis (Ctrl+Shift+A)"
               >
                   <span>📊</span>
                    Analysis
               </button>
            )}
            {explanations.length > 0 && (
              <button 
                className={`btn btn-export ${isDarkMode ? 'dark' : 'light'}`}
                onClick={() => setShowExport(true)}
                title="Export Explanations (Ctrl+Shift+E)"
              >
                <span>📤</span>
                Export
              </button>
            )}
            <ThemeToggle />
            <button 
              className={`btn btn-help ${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts (Ctrl+?)"
            >
              <span>⌨️</span>
              Shortcuts
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {error && (
            <div className={`error-message ${isDarkMode ? 'dark' : 'light'}`}>
              <span>{error}</span>
              <button 
                className="close-error"
                onClick={() => setError('')}
                title="Close (Esc)"
              >
                ×
              </button>
            </div>
          )}

          {isLoading && <Loader />}

          <div className="content-wrapper">
            <div className="input-section">
              <CodeInput 
                code={code}
                onCodeChange={setCode}
                onExplain={handleExplainCode}
                isLoading={isLoading}
                textareaRef={textareaRef}
                fileInputRef={fileInputRef}
                onClear={handleClearCode}
                onShowExamples={() => setShowExamples(true)}
                onFileUpload={handleFileUpload}
                filename={filename}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onShowAnalysis={() => setShowAnalysis(true)}
              />
            </div>
            
            <div className="explanation-section">
              {!isLoading && explanations.length > 0 && (
                 <>
                  <div className="explanation-actions">
                    <button 
                      className={`btn btn-export-sm ${isDarkMode ? 'dark' : 'light'}`}
                      onClick={() => setShowExport(true)}
                      title="Export Explanations"
                    >
                      <span>📤</span>
                      Export
                    </button>
                  </div>
                  <CodeExplanation explanations={explanations} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal 
          onClose={() => setShowShortcuts(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {showExamples && (
        <CodeExamplesLibrary
          onSelectExample={handleExampleSelect}
          isOpen={showExamples}
          onClose={() => setShowExamples(false)}
        />
      )}

      {showExport && (
        <ExportOptions
          code={code}
          explanations={explanations}
          language={currentLanguage}
          filename={filename}
          isOpen={showExport}
          onClose={() => setShowExport(false)}
        />
      )}
      {showAnalysis && (
        <CodeAnalysisMetrics
           code={code}
           language={currentLanguage}
           isOpen={showAnalysis}
           onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
}

// Keyboard Shortcuts Modal Component
const KeyboardShortcutsModal = ({ onClose, isDarkMode }) => {
  //const { shortcuts } = useKeyboardShortcuts();

  const { shortcuts: contextShortcuts } = useKeyboardShortcuts();

  // Use context shortcuts if available, otherwise use static list
  const shortcuts = contextShortcuts.length > 0 
    ? contextShortcuts 
    : [
        { key: 'ctrl+enter', description: 'Explain the current code' },
        { key: 'ctrl+s', description: 'Focus code editor' },
        { key: 'ctrl+k', description: 'Clear code editor' },
        { key: 'ctrl+o', description: 'Upload code file' },
        { key: 'ctrl+shift+e', description: 'Export code explanations' },
        { key: 'ctrl+shift+a', description: 'Show code analysis metrics' },
        { key: 'ctrl+shift+f', description: 'Format code' },
        { key: 'ctrl+e', description: 'Open code examples library' },
        { key: 'ctrl+?', description: 'Show keyboard shortcuts' },
        { key: 'escape', description: 'Close modal or clear error' }
      ];

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`shortcuts-modal ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="modal-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button 
            className="close-modal"
            onClick={onClose}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>
        
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <span className="shortcut-keys">
                {shortcut.key.split('+').map((key, i) => (
                  <kbd key={i} className="key">{key}</kbd>
                ))}
              </span>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>
        
        <div className="modal-footer">
          <button 
            className={`btn btn-primary ${isDarkMode ? 'dark' : 'light'}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;