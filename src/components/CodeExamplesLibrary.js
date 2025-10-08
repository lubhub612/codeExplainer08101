// src/components/CodeExamplesLibrary.js
import React, { useState, useMemo } from 'react';
import { codeExamples, getLanguages, searchExamples } from '../services/codeExamples';
import { useTheme } from '../contexts/ThemeContext';

export const CodeExamplesLibrary = ({ onSelectExample, isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const { isDarkMode } = useTheme();

  const languages = getLanguages();
  
  const filteredExamples = useMemo(() => {
    let examples = [];
    
    if (searchQuery.trim()) {
      examples = searchExamples(searchQuery);
    } else if (selectedLanguage === 'all') {
      examples = Object.values(codeExamples).flat();
    } else {
      examples = codeExamples[selectedLanguage] || [];
    }
    
    return examples;
  }, [selectedLanguage, searchQuery]);

  const toggleFavorite = (example) => {
    const exampleKey = `${example.name}-${selectedLanguage}`;
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(exampleKey)) {
      newFavorites.delete(exampleKey);
    } else {
      newFavorites.add(exampleKey);
    }
    
    setFavorites(newFavorites);
  };

  const isFavorite = (example) => {
    const exampleKey = `${example.name}-${selectedLanguage}`;
    return favorites.has(exampleKey);
  };

  const handleExampleSelect = (example, language) => {
    onSelectExample(example.code, language);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`examples-library-modal ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="modal-header">
          <h2>📚 Code Examples Library</h2>
          <button 
            className="close-modal"
            onClick={onClose}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <div className="library-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`search-input ${isDarkMode ? 'dark' : 'light'}`}
            />
          </div>
          
          <div className="language-filters">
            <button
              className={`language-filter ${selectedLanguage === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('all')}
            >
              🌟 All Languages
            </button>
            {languages.map(language => (
              <button
                key={language}
                className={`language-filter ${selectedLanguage === language ? 'active' : ''}`}
                onClick={() => setSelectedLanguage(language)}
              >
                {getLanguageIcon(language)} {language}
              </button>
            ))}
          </div>
        </div>

        <div className="examples-grid">
          {filteredExamples.length === 0 ? (
            <div className="no-results">
              <p>No examples found matching your criteria.</p>
              <p>Try a different search term or language filter.</p>
            </div>
          ) : (
            filteredExamples.map((example, index) => {
              const language = Object.keys(codeExamples).find(lang => 
                codeExamples[lang].includes(example)
              );
              
              return (
                <div 
                  key={index}
                  className={`example-card ${isDarkMode ? 'dark' : 'light'} ${isFavorite(example) ? 'favorite' : ''}`}
                >
                  <div className="card-header">
                    <h3>{example.name}</h3>
                    <button
                      className={`favorite-btn ${isFavorite(example) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(example)}
                      title={isFavorite(example) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite(example) ? '★' : '☆'}
                    </button>
                  </div>
                  
                  <div className="card-meta">
                    <span className="language-badge">
                      {getLanguageIcon(language)} {language}
                    </span>
                    <span className="code-lines">
                      📝 {example.code.split('\n').length} lines
                    </span>
                  </div>
                  
                  <p className="card-description">{example.description}</p>
                  
                  <div className="card-code-preview">
                    <pre>
                      <code>{example.code.split('\n').slice(0, 5).join('\n')}</code>
                    </pre>
                    {example.code.split('\n').length > 5 && (
                      <div className="code-overlay">
                        <span>... more code</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleExampleSelect(example, language)}
                    >
                      Use This Example
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="modal-footer">
          <div className="library-stats">
            <span>{filteredExamples.length} example{filteredExamples.length !== 1 ? 's' : ''} found</span>
          </div>
          <button 
            className={`btn btn-secondary ${isDarkMode ? 'dark' : 'light'}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const getLanguageIcon = (language) => {
  const icons = {
    javascript: '🟨',
    python: '🐍',
    java: '☕',
    cpp: '⚙️',
    html: '🌐',
    css: '🎨',
    php: '🐘',
    ruby: '💎',
    go: '🐹',
    rust: '🦀'
  };
  return icons[language] || '📄';
};

export default CodeExamplesLibrary;