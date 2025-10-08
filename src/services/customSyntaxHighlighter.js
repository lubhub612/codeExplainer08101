// src/services/customSyntaxHighlighter.js

export const supportedLanguages = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  php: 'PHP',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  typescript: 'TypeScript',
  sql: 'SQL',
  json: 'JSON',
  markdown: 'Markdown',
  yaml: 'YAML',
  bash: 'Bash'
};

export const languageAliases = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  cxx: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  cc: 'cpp',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  yml: 'yaml',
  md: 'markdown'
};

// Token patterns for different languages
const tokenPatterns = {
  common: {
    string: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$|--.*$)/m,
    number: /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
    keyword: /\b(function|var|let|const|if|else|for|while|return|class|import|export|from|default|extends|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|void|delete)\b/,
    operator: /([=!<>]=?|[+*/%-]=?|&&|\|\||[?:])/,
    punctuation: /([{}()[\].,;:])/
  },
  
  javascript: {
    keyword: /\b(function|var|let|const|if|else|for|while|return|class|import|export|from|default|extends|async|await|try|catch|finally|throw|new|this|super|typeof|instanceof|in|of|void|delete|true|false|null|undefined)\b/,
    function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/,
    class: /\b(class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
  },
  
  python: {
    keyword: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|None|True|False|and|or|not|in|is)\b/,
    function: /\b(def)\s+([a-zA-Z_][a-zA-Z0-9_]*)/,
    class: /\b(class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/
  },
  
  java: {
    keyword: /\b(public|private|protected|class|interface|extends|implements|static|final|void|int|String|boolean|char|byte|short|long|float|double|if|else|for|while|do|switch|case|default|return|try|catch|finally|throw|new|this|super|import|package)\b/,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*{/,
    class: /\b(class|interface)\s+([a-zA-Z_][a-zA-Z0-9_]*)/
  },
  
  html: {
    tag: /(<\/?[a-zA-Z][a-zA-Z0-9:-]*)(?:\s+[^>]*)?>/,
    attribute: /(\s+[a-zA-Z-]+)=/,
    doctype: /(<\!DOCTYPE\s+[^>]+>)/
  },
  
  css: {
    selector: /([.#]?[a-zA-Z][a-zA-Z0-9_-]*\s*{)/,
    property: /(\s*[a-zA-Z-]+\s*:)/,
    value: /(:[^;]+;)/,
    unit: /(\d+(?:px|em|rem|%|vh|vw|vmin|vmax)\b)/
  }
};

export class CustomSyntaxHighlighter {
  static detectLanguage(code, filename = '') {
    // Detect from filename first
    if (filename) {
      const extension = filename.split('.').pop().toLowerCase();
      const language = languageAliases[extension] || extension;
      if (supportedLanguages[language]) {
        return language;
      }
    }

    // Fall back to code-based detection
    return this.guessLanguageFromCode(code);
  }

  static guessLanguageFromCode(code) {
    const codeSample = code.trim().toLowerCase();

    if (codeSample.includes('<html') || codeSample.includes('<div') || codeSample.includes('<!DOCTYPE')) {
      return 'html';
    }
    if (codeSample.includes('function') || codeSample.includes('const ') || codeSample.includes('let ') || codeSample.includes('console.log')) {
      return 'javascript';
    }
    if (codeSample.includes('def ') || codeSample.includes('import ') || codeSample.includes('print(')) {
      return 'python';
    }
    if (codeSample.includes('public class') || codeSample.includes('System.out.println')) {
      return 'java';
    }
    if (codeSample.includes('#include') || codeSample.includes('std::') || codeSample.includes('cout <<')) {
      return 'cpp';
    }
    if (codeSample.includes('<?php') || codeSample.includes('$_')) {
      return 'php';
    }
    if (codeSample.includes('<?xml') || codeSample.startsWith('<')) {
      return 'xml';
    }
    if (codeSample.includes('{') && codeSample.includes('}') && codeSample.includes(':')) {
      return 'css';
    }

    return 'javascript'; // default
  }

  static highlight(code, language = 'javascript') {
    if (!code || !code.trim()) {
      return this.escapeHtml(code);
    }

    const validLanguage = supportedLanguages[language] ? language : 'javascript';
    
    try {
      return this.highlightCode(code, validLanguage);
    } catch (error) {
      console.warn(`Syntax highlighting failed for language: ${language}`, error);
      return this.escapeHtml(code);
    }
  }

  static highlightCode(code, language) {
    const lines = code.split('\n');
    const highlightedLines = lines.map(line => this.highlightLine(line, language));
    return highlightedLines.join('\n');
  }

  static highlightLine(line, language) {
    if (!line.trim()) return this.escapeHtml(line);

    let highlighted = this.escapeHtml(line);
    
    // Apply language-specific patterns first
    const langPatterns = tokenPatterns[language] || {};
    const allPatterns = { ...tokenPatterns.common, ...langPatterns };

    // Process tokens in order of importance
    const tokenOrder = ['comment', 'string', 'keyword', 'number', 'function', 'class', 'operator', 'punctuation'];
    
    for (const tokenType of tokenOrder) {
      if (allPatterns[tokenType]) {
        highlighted = highlighted.replace(
          allPatterns[tokenType],
          (match, ...groups) => {
            const content = groups.find(g => g !== undefined) || match;
            return `<span class="token ${tokenType}">${content}</span>`;
          }
        );
      }
    }

    // Special handling for HTML
    if (language === 'html') {
      highlighted = this.highlightHTML(highlighted);
    }

    // Special handling for CSS
    if (language === 'css') {
      highlighted = this.highlightCSS(highlighted);
    }

    return highlighted;
  }

  static highlightHTML(code) {
    return code
      .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9:-]*)(?:\s+[^&]*?)?(&gt;)/g, '<span class="token tag">$1</span><span class="token punctuation">$2</span>')
      .replace(/(\s+[a-zA-Z-]+)=/g, '<span class="token attribute">$1</span>=')
      .replace(/="[^"]*"/g, '<span class="token string">$&</span>');
  }

  static highlightCSS(code) {
    return code
      .replace(/([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*{/g, '<span class="token selector">$1</span> {')
      .replace(/(\s*[a-zA-Z-]+\s*:)/g, '<span class="token property">$1</span>')
      .replace(/(:\s*[^;]+;)/g, '<span class="token value">$1</span>')
      .replace(/(\d+(?:px|em|rem|%|vh|vw)\b)/g, '<span class="token number">$1</span>');
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static getLanguageName(language) {
    return supportedLanguages[language] || 'Unknown';
  }

  static isSupported(language) {
    return !!supportedLanguages[language];
  }

  static getAllSupportedLanguages() {
    return Object.keys(supportedLanguages);
  }

  static getLanguageIcon(language) {
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
      rust: '🦀',
      typescript: '🔷',
      sql: '🗃️',
      json: '📋',
      markdown: '📝',
      yaml: '⚙️',
      bash: '💻'
    };
    return icons[language] || '📄';
  }
}

export default CustomSyntaxHighlighter;