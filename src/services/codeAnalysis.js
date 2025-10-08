// src/services/codeAnalysis.js

export class CodeAnalysis {
  static analyzeCode(code, language = 'javascript') {
    if (!code || !code.trim()) {
      return this.getEmptyMetrics();
    }

    const lines = code.split('\n');
    const analysis = {
      basic: this.getBasicMetrics(code, lines),
      complexity: this.getComplexityMetrics(code, language),
      quality: this.getQualityMetrics(code, lines, language),
      structure: this.getStructureMetrics(code, language),
      issues: this.getCodeIssues(code, language)
    };

    analysis.overall = this.calculateOverallScore(analysis);
    
    return analysis;
  }

  static getBasicMetrics(code, lines) {
    const totalLines = lines.length;
    const codeLines = lines.filter(line => line.trim().length > 0).length;
    const emptyLines = totalLines - codeLines;
    const commentLines = lines.filter(line => this.isCommentLine(line)).length;
    const totalCharacters = code.length;
    const nonWhitespaceCharacters = code.replace(/\s/g, '').length;

    return {
      totalLines,
      codeLines,
      emptyLines,
      commentLines,
      commentRatio: commentLines / codeLines || 0,
      totalCharacters,
      nonWhitespaceCharacters,
      averageLineLength: totalCharacters / totalLines || 0
    };
  }

  static getComplexityMetrics(code, language) {
    const lines = code.split('\n');
    
    // Count control structures
    const controlKeywords = this.getControlKeywords(language);
    let controlStructures = 0;
    let maxNesting = 0;
    let currentNesting = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Check for control structure starts
      controlKeywords.start.forEach(keyword => {
        if (new RegExp(`\\b${keyword}\\b`).test(trimmed)) {
          controlStructures++;
          currentNesting++;
          maxNesting = Math.max(maxNesting, currentNesting);
        }
      });

      // Check for control structure ends
      controlKeywords.end.forEach(keyword => {
        if (new RegExp(`\\b${keyword}\\b`).test(trimmed)) {
          currentNesting = Math.max(0, currentNesting - 1);
        }
      });
    });

    // Estimate cyclomatic complexity
    const cyclomaticComplexity = controlStructures + 1;

    return {
      controlStructures,
      maxNesting,
      cyclomaticComplexity,
      complexityLevel: this.getComplexityLevel(cyclomaticComplexity)
    };
  }

  static getQualityMetrics(code, lines, language) {
    const issues = this.detectQualityIssues(code, language);
    const maintainability = this.calculateMaintainabilityIndex(code, language);
    const readability = this.calculateReadabilityScore(code, language);

    return {
      maintainabilityIndex: maintainability,
      readabilityScore: readability,
      qualityIssues: issues.length,
      issueBreakdown: issues,
      qualityLevel: this.getQualityLevel(maintainability, issues.length)
    };
  }

  static getStructureMetrics(code, language) {
    const lines = code.split('\n');
    
    // Count functions, classes, imports, etc.
    const functions = this.countFunctions(code, language);
    const classes = this.countClasses(code, language);
    const imports = this.countImports(code, language);
    
    // Calculate cohesion metrics
    const functionLengths = functions.map(fn => fn.lineCount);
    const avgFunctionLength = functionLengths.reduce((a, b) => a + b, 0) / functionLengths.length || 0;

    return {
      functions: functions.length,
      classes: classes.length,
      imports: imports.length,
      avgFunctionLength,
      maxFunctionLength: Math.max(...functionLengths, 0),
      hasMainFunction: this.hasMainFunction(code, language),
      structureScore: this.calculateStructureScore(functions.length, classes.length, avgFunctionLength)
    };
  }

  static getCodeIssues(code, language) {
    const issues = this.detectCodeIssues(code, language);
    
    return {
      totalIssues: issues.length,
      bySeverity: {
        high: issues.filter(issue => issue.severity === 'high').length,
        medium: issues.filter(issue => issue.severity === 'medium').length,
        low: issues.filter(issue => issue.severity === 'low').length
      },
      byCategory: this.groupIssuesByCategory(issues),
      issues: issues
    };
  }

  // Helper methods
  static isCommentLine(line) {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('--') ||
      trimmed.includes('*/')
    );
  }

  static getControlKeywords(language) {
    const keywords = {
      javascript: {
        start: ['if', 'for', 'while', 'switch', 'case', 'catch', '&&', '\\|\\|', '\\?'],
        end: ['else', '}', 'break', 'continue']
      },
      python: {
        start: ['if', 'for', 'while', 'elif', 'except', 'and', 'or'],
        end: ['else', 'elif']
      },
      java: {
        start: ['if', 'for', 'while', 'switch', 'case', 'catch', '&&', '\\|\\|'],
        end: ['else', '}', 'break', 'continue']
      },
      cpp: {
        start: ['if', 'for', 'while', 'switch', 'case', 'catch', '&&', '\\|\\|'],
        end: ['else', '}', 'break', 'continue']
      }
    };

    return keywords[language] || keywords.javascript;
  }

  static countFunctions(code, language) {
    const patterns = {
      javascript: /(?:function\s+(\w+)\s*\([^)]*\)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|let\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|(\w+)\s*\([^)]*\)\s*{)/g,
      python: /def\s+(\w+)\s*\([^)]*\):/g,
      java: /(?:public|private|protected)\s+(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{/g,
      cpp: /(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*{/g
    };

    const pattern = patterns[language] || patterns.javascript;
    const functions = [];
    let match;

    while ((match = pattern.exec(code)) !== null) {
      const functionName = match[1] || match[2] || match[3] || match[4] || 'anonymous';
      functions.push({
        name: functionName,
        line: code.substring(0, match.index).split('\n').length
      });
    }

    return functions;
  }

  static countClasses(code, language) {
    const patterns = {
      javascript: /class\s+(\w+)/g,
      python: /class\s+(\w+)/g,
      java: /class\s+(\w+)/g,
      cpp: /class\s+(\w+)/g
    };

    const pattern = patterns[language] || patterns.javascript;
    const classes = [];
    let match;

    while ((match = pattern.exec(code)) !== null) {
      classes.push({
        name: match[1],
        line: code.substring(0, match.index).split('\n').length
      });
    }

    return classes;
  }

  static countImports(code, language) {
    const patterns = {
      javascript: /(?:import|require)\s+[^;]+/g,
      python: /import\s+\w+|from\s+\w+/g,
      java: /import\s+[^;]+/g,
      cpp: /#include\s+[^\\n]+/g
    };

    const pattern = patterns[language] || patterns.javascript;
    const matches = code.match(pattern) || [];
    return matches.length;
  }

  static hasMainFunction(code, language) {
    const patterns = {
      javascript: /function\s+main\s*\(|const\s+main\s*=/,
      python: /def\s+main\s*\(/,
      java: /public\s+static\s+void\s+main\s*\(/,
      cpp: /int\s+main\s*\(/
    };

    const pattern = patterns[language];
    return pattern ? pattern.test(code) : false;
  }

  static detectQualityIssues(code, language) {
    const issues = [];

    // Long lines
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 100) {
        issues.push({
          type: 'long_line',
          severity: 'low',
          message: `Line ${index + 1} is too long (${line.length} characters)`,
          line: index + 1
        });
      }
    });

    // Deep nesting
    const nesting = this.detectDeepNesting(code, language);
    if (nesting > 3) {
      issues.push({
        type: 'deep_nesting',
        severity: 'medium',
        message: `Code has deep nesting (${nesting} levels)`,
        line: 0
      });
    }

    // TODO: Add more quality checks
    // - Unused variables
    // - Complex expressions
    // - Magic numbers
    // - Code duplication patterns

    return issues;
  }

  static detectCodeIssues(code, language) {
    const issues = [];

    // Basic syntax issues
    const lines = code.split('\n');
    
    // Check for missing semicolons in JS (basic check)
    if (language === 'javascript') {
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && 
            !trimmed.startsWith('/*') && !trimmed.startsWith('*') &&
            !trimmed.startsWith('}') && !trimmed.endsWith('{') &&
            !trimmed.endsWith('}') && !trimmed.includes('if') &&
            !trimmed.includes('for') && !trimmed.includes('while') &&
            !trimmed.endsWith(';') && !trimmed.endsWith('{') &&
            !trimmed.endsWith('}') && !trimmed.startsWith('function') &&
            !trimmed.startsWith('const') && !trimmed.startsWith('let') &&
            !trimmed.startsWith('var') && !trimmed.startsWith('class')) {
          issues.push({
            type: 'missing_semicolon',
            severity: 'low',
            message: `Possible missing semicolon at line ${index + 1}`,
            line: index + 1
          });
        }
      });
    }

    // Check for potential undefined variables
    const variablePattern = /(\w+)\s*=/g;
    let match;
    const declaredVars = new Set();

    while ((match = variablePattern.exec(code)) !== null) {
      declaredVars.add(match[1]);
    }

    // Simple undefined variable check (very basic)
    const usagePattern = /[^a-zA-Z0-9_](\w+)(?:\s*[^=]|$)/g;
    while ((match = usagePattern.exec(code)) !== null) {
      const varName = match[1];
      if (!declaredVars.has(varName) && 
          !this.isReservedWord(varName) && 
          varName.length > 1) {
        issues.push({
          type: 'potential_undefined',
          severity: 'medium',
          message: `Potential undefined variable '${varName}'`,
          line: code.substring(0, match.index).split('\n').length
        });
      }
    }

    return issues;
  }

  static detectDeepNesting(code, language) {
    const lines = code.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;
    const controlKeywords = this.getControlKeywords(language);

    lines.forEach(line => {
      const trimmed = line.trim();
      
      controlKeywords.start.forEach(keyword => {
        if (new RegExp(`\\b${keyword}\\b`).test(trimmed)) {
          currentNesting++;
          maxNesting = Math.max(maxNesting, currentNesting);
        }
      });

      controlKeywords.end.forEach(keyword => {
        if (new RegExp(`\\b${keyword}\\b`).test(trimmed)) {
          currentNesting = Math.max(0, currentNesting - 1);
        }
      });
    });

    return maxNesting;
  }

  static isReservedWord(word) {
    const reserved = [
      'if', 'else', 'for', 'while', 'function', 'return', 'var', 'let', 'const',
      'class', 'import', 'export', 'default', 'this', 'new', 'typeof', 'instanceof',
      'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'console', 'log'
    ];
    return reserved.includes(word);
  }

  static calculateMaintainabilityIndex(code, language) {
    // Simplified maintainability index calculation
    const lines = code.split('\n');
    const codeLines = lines.filter(line => line.trim().length > 0 && !this.isCommentLine(line)).length;
    const complexity = this.getComplexityMetrics(code, language).cyclomaticComplexity;
    
    // Basic formula (simplified)
    const maintainability = Math.max(0, 100 - (codeLines * 0.1) - (complexity * 2));
    return Math.round(maintainability);
  }

  static calculateReadabilityScore(code, language) {
    // Simplified readability score
    const lines = code.split('\n');
    const avgLineLength = code.length / lines.length;
    const commentRatio = this.getBasicMetrics(code, lines).commentRatio;
    
    // Basic formula favoring shorter lines and good commenting
    let score = 100;
    score -= Math.min(50, (avgLineLength - 40) * 2); // Penalize long lines
    score += commentRatio * 20; // Reward comments
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static calculateStructureScore(functions, classes, avgFunctionLength) {
    let score = 50;
    
    // Reward having functions (but not too many)
    if (functions > 0 && functions <= 10) score += 20;
    if (functions > 10) score -= 10;
    
    // Reward having classes
    if (classes > 0) score += 10;
    
    // Penalize very long functions
    if (avgFunctionLength > 30) score -= 20;
    if (avgFunctionLength > 50) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  static calculateOverallScore(analysis) {
    const weights = {
      maintainability: 0.3,
      readability: 0.25,
      complexity: 0.2,
      structure: 0.15,
      issues: 0.1
    };

    let score = 0;
    
    // Maintainability (0-100)
    score += analysis.quality.maintainabilityIndex * weights.maintainability;
    
    // Readability (0-100)
    score += analysis.quality.readabilityScore * weights.readability;
    
    // Complexity (inverse - lower complexity is better)
    const complexityScore = Math.max(0, 100 - (analysis.complexity.cyclomaticComplexity * 5));
    score += complexityScore * weights.complexity;
    
    // Structure (0-100)
    score += analysis.structure.structureScore * weights.structure;
    
    // Issues (penalty)
    const issuePenalty = Math.min(30, analysis.issues.totalIssues * 5);
    score -= issuePenalty * weights.issues;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static getComplexityLevel(complexity) {
    if (complexity <= 5) return 'Low';
    if (complexity <= 10) return 'Medium';
    if (complexity <= 20) return 'High';
    return 'Very High';
  }

  static getQualityLevel(maintainability, issues) {
    if (maintainability >= 80 && issues === 0) return 'Excellent';
    if (maintainability >= 60 && issues <= 2) return 'Good';
    if (maintainability >= 40 && issues <= 5) return 'Fair';
    return 'Needs Improvement';
  }

  static groupIssuesByCategory(issues) {
    const categories = {};
    issues.forEach(issue => {
      categories[issue.type] = (categories[issue.type] || 0) + 1;
    });
    return categories;
  }

  static getEmptyMetrics() {
    return {
      basic: {
        totalLines: 0,
        codeLines: 0,
        emptyLines: 0,
        commentLines: 0,
        commentRatio: 0,
        totalCharacters: 0,
        nonWhitespaceCharacters: 0,
        averageLineLength: 0
      },
      complexity: {
        controlStructures: 0,
        maxNesting: 0,
        cyclomaticComplexity: 0,
        complexityLevel: 'Low'
      },
      quality: {
        maintainabilityIndex: 0,
        readabilityScore: 0,
        qualityIssues: 0,
        issueBreakdown: [],
        qualityLevel: 'Unknown'
      },
      structure: {
        functions: 0,
        classes: 0,
        imports: 0,
        avgFunctionLength: 0,
        maxFunctionLength: 0,
        hasMainFunction: false,
        structureScore: 0
      },
      issues: {
        totalIssues: 0,
        bySeverity: { high: 0, medium: 0, low: 0 },
        byCategory: {},
        issues: []
      },
      overall: 0
    };
  }
}

export default CodeAnalysis;