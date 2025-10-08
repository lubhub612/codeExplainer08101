// src/components/CustomHighlightedCodeBlock.js
import React, { useEffect, useState, useRef } from 'react';
import CustomSyntaxHighlighter from '../services/customSyntaxHighlighter';
import { useTheme } from '../contexts/ThemeContext';
import './CustomHighlightedCodeBlock.css';

export const CustomHighlightedCodeBlock = ({ 
  code, 
  language = 'javascript', 
  lineNumbers = false,
  showCopyButton = true,
  className = '',
  maxHeight = 'none',
  editable = false,
  onChange
}) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (code) {
      const highlighted = CustomSyntaxHighlighter.highlight(code, language);
      setHighlightedCode(highlighted);
    } else {
      setHighlightedCode('');
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const lines = code ? code.split('\n') : [];
  const shouldShowLineNumbers = lineNumbers && lines.length > 1;

  const handleCodeChange = (e) => {
    if (editable && onChange) {
      onChange(e.target.textContent);
    }
  };

  return (
    <div className={`custom-code-block ${isDarkMode ? 'dark' : 'light'} ${className}`}>
      <div className="code-block-header">
        <div className="language-badge">
          <span className="language-icon">
            {CustomSyntaxHighlighter.getLanguageIcon(language)}
          </span>
          <span className="language-name">
            {CustomSyntaxHighlighter.getLanguageName(language)}
          </span>
        </div>
        
        {showCopyButton && code && (
          <button 
            className={`copy-button ${isCopied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {isCopied ? '✓ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>

      <div 
        className="code-block-content"
        style={{ maxHeight }}
      >
        {shouldShowLineNumbers && (
          <div className="line-numbers">
            {lines.map((_, index) => (
              <div key={index + 1} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
        )}
        
        <pre 
          className={`code-pre ${shouldShowLineNumbers ? 'with-line-numbers' : ''}`}
        >
          <code
            ref={codeRef}
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            contentEditable={editable}
            onBlur={handleCodeChange}
            suppressContentEditableWarning={true}
          />
        </pre>
      </div>
    </div>
  );
};

export default CustomHighlightedCodeBlock;