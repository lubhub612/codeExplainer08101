// src/services/languageDetection.js

const LANGUAGE_HEURISTICS = {
  javascript: {
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    patterns: [
      /import\s+.*\s+from\s+['"]/,
      /export\s+(default\s+)?(function|class|const|let)/,
      /console\.log/,
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=\s*\(\)\s*=>/,
      /document\.getElementById/,
      /React\./,
      /useState\(\)/,
      /require\(['"]/
    ],
    keywords: ['function', 'const', 'let', 'var', 'return', 'import', 'export', 'console']
  },
  python: {
    extensions: ['.py', '.pyw', '.pyx'],
    patterns: [
      /^def\s+\w+\s*\(/m,
      /^class\s+\w+/m,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /print\(/,
      /if\s+__name__\s*==\s*['"]__main__['"]/,
      /:\s*$/,
      /#.*$/
    ],
    keywords: ['def', 'class', 'import', 'from', 'print', 'if', 'else', 'for', 'while']
  },
  java: {
    extensions: ['.java'],
    patterns: [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.println/,
      /import\s+java\./,
      /private\s+\w+\s+\w+;/,
      /@Override/,
      /new\s+\w+\(\)/
    ],
    keywords: ['public', 'class', 'static', 'void', 'main', 'import', 'System.out.println']
  },
  cpp: {
    extensions: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
    patterns: [
      /#include\s*<.*>/,
      /using\s+namespace\s+std;/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /int\s+main\(\)/,
      /return\s+0;/
    ],
    keywords: ['#include', 'using namespace', 'std::', 'cout', 'cin', 'int main()']
  },
  html: {
    extensions: ['.html', '.htm'],
    patterns: [
      /<!DOCTYPE html>/,
      /<html.*>/,
      /<head>.*<\/head>/s,
      /<body>.*<\/body>/s,
      /<div.*>/,
      /<script.*>/,
      /<style.*>/
    ],
    keywords: ['<html>', '<head>', '<body>', '<div>', '<script>', '<style>']
  },
  css: {
    extensions: ['.css'],
    patterns: [
      /.*\{[^}]*\}/,
      /@media/,
      /@keyframes/,
      /\.\w+\s*\{/,
      /#\w+\s*\{/,
      /:\s*(hover|focus|active)/
    ],
    keywords: ['{', '}', ';', '.class', '#id', '@media']
  },
  php: {
    extensions: ['.php'],
    patterns: [
      /<\?php/,
      /\$[a-zA-Z_]\w*\s*=/,
      /echo\s+.+;/,
      /function\s+\w+\s*\(/,
      /->\w+\s*\(/
    ],
    keywords: ['<?php', '?>', '$', 'echo', 'function', '->']
  },
  ruby: {
    extensions: ['.rb'],
    patterns: [
      /def\s+\w+/,
      /class\s+\w+/,
      /puts\s+/,
      /end$/,
      /@\w+/,
      /:\w+=>/
    ],
    keywords: ['def', 'class', 'end', 'puts', '@var', '=>']
  },
  go: {
    extensions: ['.go'],
    patterns: [
      /package\s+main/,
      /import\s*\(/,
      /func\s+main\(\)/,
      /fmt\.Print/,
      /:=\s*/,
      /go\s+func\(\)/
    ],
    keywords: ['package', 'import', 'func', ':=', 'go func()']
  },
  rust: {
    extensions: ['.rs'],
    patterns: [
      /fn\s+main\(\)/,
      /let\s+mut\s+\w+/,
      /println!/,
      /\.unwrap\(\)/,
      /->\s*\w+/
    ],
    keywords: ['fn', 'let mut', 'println!', 'unwrap()', '->']
  }
};

class LanguageDetector {
  detectFromCode(code) {
    if (!code || code.trim().length === 0) {
      return 'auto';
    }

    const lines = code.split('\n').slice(0, 50); // Check first 50 lines
    const scores = {};
    
    // Initialize scores
    Object.keys(LANGUAGE_HEURISTICS).forEach(lang => {
      scores[lang] = 0;
    });

    // Check patterns
    lines.forEach(line => {
      Object.entries(LANGUAGE_HEURISTICS).forEach(([lang, { patterns, keywords }]) => {
        // Pattern matching
        patterns.forEach(pattern => {
          if (pattern.test(line)) {
            scores[lang] += 2;
          }
        });
        
        // Keyword matching
        keywords.forEach(keyword => {
          if (line.includes(keyword)) {
            scores[lang] += 1;
          }
        });
      });
    });

    // Check for shebang
    const firstLine = lines[0] || '';
    if (firstLine.startsWith('#!')) {
      if (firstLine.includes('python')) return 'python';
      if (firstLine.includes('node')) return 'javascript';
      if (firstLine.includes('bash') || firstLine.includes('sh')) return 'javascript'; // Default to JS for shell scripts
    }

    // Find language with highest score
    let detectedLang = 'auto';
    let highestScore = 0;

    Object.entries(scores).forEach(([lang, score]) => {
      if (score > highestScore) {
        highestScore = score;
        detectedLang = lang;
      }
    });

    // Only return detected language if confidence is high enough
    return highestScore >= 3 ? detectedLang : 'auto';
  }

  detectFromFilename(filename) {
    if (!filename) return 'auto';

    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    for (const [lang, config] of Object.entries(LANGUAGE_HEURISTICS)) {
      if (config.extensions.includes(extension)) {
        return lang;
      }
    }

    return 'auto';
  }

  detectLanguage(code, filename = null) {
    // First try filename detection (more reliable)
    if (filename) {
      const fromFilename = this.detectFromFilename(filename);
      if (fromFilename !== 'auto') {
        return fromFilename;
      }
    }

    // Fall back to code analysis
    return this.detectFromCode(code);
  }

  getLanguageInfo(language) {
    const languageNames = {
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
      auto: 'Auto-detect'
    };

    const languageIcons = {
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
      auto: '🔍'
    };

    return {
      name: languageNames[language] || language,
      icon: languageIcons[language] || '📄'
    };
  }
}

export default new LanguageDetector();