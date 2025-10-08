// src/services/syntaxErrorDetector.js

export class SyntaxErrorDetector {
  static detectErrors(code, language = 'javascript') {
    if (!code || !code.trim()) {
      return { errors: [], warnings: [], isValid: true };
    }

    const errors = [];
    const warnings = [];

    // Language-specific error detection
    switch (language) {
      case 'javascript':
        this.detectJavaScriptErrors(code, errors, warnings);
        break;
      case 'python':
        this.detectPythonErrors(code, errors, warnings);
        break;
      case 'java':
        this.detectJavaErrors(code, errors, warnings);
        break;
      case 'cpp':
        this.detectCppErrors(code, errors, warnings);
        break;
      case 'html':
        this.detectHtmlErrors(code, errors, warnings);
        break;
      case 'css':
        this.detectCssErrors(code, errors, warnings);
        break;
      default:
        this.detectCommonErrors(code, errors, warnings);
    }

    // Common error detection for all languages
    this.detectCommonErrors(code, errors, warnings);

    return {
      errors,
      warnings,
      isValid: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      summary: this.generateSummary(errors, warnings)
    };
  }

  static detectJavaScriptErrors(code, errors, warnings) {
    const lines = code.split('\n');
    
    // Check for unmatched brackets
    this.checkUnmatchedBrackets(code, 'JavaScript', errors);
    
    // Check for missing semicolons (optional but common)
    this.checkMissingSemicolons(code, lines, warnings);
    
    // Check for undefined variables
    this.checkUndefinedVariables(code, lines, warnings);
    
    // Check for common syntax patterns
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      // Check for assignment in condition
      if (this.hasAssignmentInCondition(trimmed)) {
        warnings.push({
          line: lineNumber,
          column: line.indexOf('=') + 1,
          message: 'Possible assignment in conditional statement',
          severity: 'warning',
          type: 'assignment_in_condition',
          suggestion: 'Use === for comparison instead of ='
        });
      }

      // Check for missing function parentheses
      if (this.isMissingFunctionParentheses(trimmed)) {
        errors.push({
          line: lineNumber,
          column: trimmed.indexOf('function') + 1,
          message: 'Missing parentheses in function declaration',
          severity: 'error',
          type: 'missing_parentheses',
          suggestion: 'Add parentheses after function name: function name() {}'
        });
      }

      // Check for invalid regex
      if (this.hasInvalidRegex(trimmed)) {
        errors.push({
          line: lineNumber,
          column: line.indexOf('/') + 1,
          message: 'Invalid regular expression',
          severity: 'error',
          type: 'invalid_regex',
          suggestion: 'Check regex syntax and escape special characters'
        });
      }

      // Check for template literal errors
      if (this.hasUnclosedTemplateLiteral(line, lines, index)) {
        errors.push({
          line: lineNumber,
          column: line.lastIndexOf('`') + 1,
          message: 'Unclosed template literal',
          severity: 'error',
          type: 'unclosed_template_literal',
          suggestion: 'Add closing backtick `'
        });
      }
    });

    // Check for console.log statements (warnings)
    if (code.includes('console.log')) {
      warnings.push({
        line: 0,
        column: 0,
        message: 'Console.log statements found in code',
        severity: 'warning',
        type: 'console_log',
        suggestion: 'Remove console.log statements for production code'
      });
    }
  }

  static detectPythonErrors(code, errors, warnings) {
    const lines = code.split('\n');
    
    // Check for indentation errors
    this.checkPythonIndentation(code, lines, errors);
    
    // Check for missing colons
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      if (this.isPythonMissingColon(trimmed)) {
        errors.push({
          line: lineNumber,
          column: trimmed.length,
          message: 'Missing colon at end of statement',
          severity: 'error',
          type: 'missing_colon',
          suggestion: 'Add colon : at the end of the statement'
        });
      }

      // Check for mixed tabs and spaces
      if (line.includes('\t') && line.includes(' ')) {
        warnings.push({
          line: lineNumber,
          column: 1,
          message: 'Mixed tabs and spaces in indentation',
          severity: 'warning',
          type: 'mixed_indentation',
          suggestion: 'Use either tabs or spaces consistently for indentation'
        });
      }

      // Check for invalid syntax in print statements (Python 2 vs 3)
      if (trimmed.startsWith('print ') && !trimmed.startsWith('print(')) {
        warnings.push({
          line: lineNumber,
          column: 1,
          message: 'Python 2 print statement detected',
          severity: 'warning',
          type: 'python2_print',
          suggestion: 'Use print() function for Python 3 compatibility'
        });
      }
    });

    // Check for unmatched parentheses in Python
    this.checkUnmatchedBrackets(code, 'Python', errors);
  }

  static detectJavaErrors(code, errors, warnings) {
    const lines = code.split('\n');
    
    // Check for missing semicolons
    this.checkMissingSemicolons(code, lines, errors, true);
    
    // Check for class declaration errors
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      // Check for missing class braces
      if (trimmed.startsWith('class ') && !trimmed.includes('{')) {
        const nextLine = lines[index + 1] || '';
        if (!nextLine.trim().startsWith('{')) {
          errors.push({
            line: lineNumber,
            column: trimmed.length,
            message: 'Missing opening brace for class',
            severity: 'error',
            type: 'missing_brace',
            suggestion: 'Add { after class declaration'
          });
        }
      }

      // Check for missing return types
      if (this.isJavaMissingReturnType(trimmed)) {
        warnings.push({
          line: lineNumber,
          column: 1,
          message: 'Method missing return type',
          severity: 'warning',
          type: 'missing_return_type',
          suggestion: 'Specify return type for method'
        });
      }
    });

    // Check for unmatched brackets
    this.checkUnmatchedBrackets(code, 'Java', errors);
  }

  static detectCppErrors(code, errors, warnings) {
    const lines = code.split('\n');
    
    // Check for missing semicolons
    this.checkMissingSemicolons(code, lines, errors, true);
    
    // Check for include errors
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      if (trimmed.startsWith('#include') && !trimmed.match(/#include\s*[<"][^>"]+[>"]/)) {
        errors.push({
          line: lineNumber,
          column: 1,
          message: 'Invalid include directive',
          severity: 'error',
          type: 'invalid_include',
          suggestion: 'Use #include <header> or #include "header"'
        });
      }
    });

    // Check for unmatched brackets
    this.checkUnmatchedBrackets(code, 'C++', errors);
  }

  static detectHtmlErrors(code, errors, warnings) {
    const lines = code.split('\n');
    
    // Check for unclosed tags
    this.checkUnclosedHtmlTags(code, errors);
    
    // Check for missing doctype
    if (!code.includes('<!DOCTYPE') && !code.includes('<!doctype')) {
      warnings.push({
        line: 1,
        column: 1,
        message: 'Missing DOCTYPE declaration',
        severity: 'warning',
        type: 'missing_doctype',
        suggestion: 'Add <!DOCTYPE html> at the beginning'
      });
    }

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for missing alt attributes
      if (line.includes('<img') && !line.includes('alt=')) {
        warnings.push({
          line: lineNumber,
          column: line.indexOf('<img') + 1,
          message: 'Image missing alt attribute',
          severity: 'warning',
          type: 'missing_alt',
          suggestion: 'Add alt attribute for accessibility'
        });
      }

      // Check for deprecated tags
      const deprecatedTags = ['<center>', '<font>', '<marquee>', '<blink>'];
      deprecatedTags.forEach(tag => {
        if (line.includes(tag)) {
          warnings.push({
            line: lineNumber,
            column: line.indexOf(tag) + 1,
            message: `Deprecated HTML tag: ${tag}`,
            severity: 'warning',
            type: 'deprecated_tag',
            suggestion: `Use CSS instead of ${tag}`
          });
        }
      });
    });
  }

  static detectCssErrors(code, errors, warnings) {
    const lines = code.split('\n');
    
    // Check for unmatched braces
    this.checkUnmatchedBrackets(code, 'CSS', errors);
    
    // Check for missing semicolons
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      if (trimmed && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') && 
          !trimmed.startsWith('@') &&
          !trimmed.endsWith(';') &&
          !trimmed.startsWith('/*') &&
          !trimmed.endsWith('*/')) {
        errors.push({
          line: lineNumber,
          column: trimmed.length,
          message: 'Missing semicolon',
          severity: 'error',
          type: 'missing_semicolon',
          suggestion: 'Add ; at the end of the declaration'
        });
      }

      // Check for invalid properties
      if (trimmed.includes(':') && !trimmed.includes(';')) {
        const property = trimmed.split(':')[0].trim();
        const invalidProperties = ['colour', 'font-color', 'bgcolor'];
        if (invalidProperties.includes(property)) {
          warnings.push({
            line: lineNumber,
            column: line.indexOf(property) + 1,
            message: `Possible invalid property: ${property}`,
            severity: 'warning',
            type: 'invalid_property',
            suggestion: `Did you mean 'color'?`
          });
        }
      }
    });
  }

  static detectCommonErrors(code, errors, warnings) {
    const lines = code.split('\n');

    // Check for trailing whitespace
    lines.forEach((line, index) => {
      if (line.endsWith(' ')) {
        warnings.push({
          line: index + 1,
          column: line.length,
          message: 'Trailing whitespace',
          severity: 'warning',
          type: 'trailing_whitespace',
          suggestion: 'Remove trailing spaces'
        });
      }
    });

    // Check for long lines
    lines.forEach((line, index) => {
      if (line.length > 100) {
        warnings.push({
          line: index + 1,
          column: 100,
          message: 'Line too long',
          severity: 'warning',
          type: 'long_line',
          suggestion: 'Break long line into multiple lines'
        });
      }
    });
  }

  // Helper methods
  static checkUnmatchedBrackets(code, language, errors) {
    const stack = [];
    const lines = code.split('\n');
    const bracketPairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>'
    };

    const stringDelimiters = ['"', "'", '`'];
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const line = code.substring(0, i).split('\n').length;
      const column = i - code.lastIndexOf('\n', i - 1);

      // Handle string literals
      if (stringDelimiters.includes(char) && !inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && inString) {
        inString = false;
        stringChar = '';
      }

      if (inString) continue;

      // Handle brackets
      if (bracketPairs[char]) {
        stack.push({ char, line, column, index: i });
      } else if (Object.values(bracketPairs).includes(char)) {
        const last = stack.pop();
        if (!last || bracketPairs[last.char] !== char) {
          errors.push({
            line,
            column,
            message: `Unmatched ${char}`,
            severity: 'error',
            type: 'unmatched_bracket',
            suggestion: `Check for missing opening ${this.getMatchingBracket(char)}`
          });
        }
      }
    }

    // Check for unclosed brackets
    stack.forEach(({ char, line, column }) => {
      errors.push({
        line,
        column,
        message: `Unclosed ${char}`,
        severity: 'error',
        type: 'unclosed_bracket',
        suggestion: `Add closing ${bracketPairs[char]}`
      });
    });
  }

  static getMatchingBracket(bracket) {
    const pairs = {
      ')': '(',
      ']': '[',
      '}': '{',
      '>': '<'
    };
    return pairs[bracket] || bracket;
  }

  static checkMissingSemicolons(code, lines, issues, isRequired = false) {
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      
      if (trimmed && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') &&
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('/*') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('import ') &&
          !trimmed.startsWith('export ') &&
          !trimmed.startsWith('function ') &&
          !trimmed.startsWith('if ') &&
          !trimmed.startsWith('for ') &&
          !trimmed.startsWith('while ') &&
          !trimmed.startsWith('class ') &&
          !trimmed.includes(' => ') &&
          !trimmed.endsWith(':') &&
          isRequired) {
        issues.push({
          line: lineNumber,
          column: trimmed.length,
          message: 'Missing semicolon',
          severity: isRequired ? 'error' : 'warning',
          type: 'missing_semicolon',
          suggestion: 'Add ; at the end of the statement'
        });
      }
    });
  }

  static checkUndefinedVariables(code, lines, warnings) {
    // Simple undefined variable detection
    const variableDeclarations = new Set();
    const patterns = [
      /(?:var|let|const)\s+(\w+)/g,
      /function\s+(\w+)/g,
      /class\s+(\w+)/g
    ];

    // Find all declared variables
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        variableDeclarations.add(match[1]);
      }
    });

    // Check for usage of undeclared variables (basic check)
    const usagePattern = /[^a-zA-Z0-9_\.](\w+)(?:\s*[^=]|$)/g;
    let match;
    const usedVariables = new Set();

    while ((match = usagePattern.exec(code)) !== null) {
      const varName = match[1];
      if (!this.isReservedWord(varName) && 
          !variableDeclarations.has(varName) && 
          varName.length > 1) {
        usedVariables.add(varName);
      }
    }

    usedVariables.forEach(varName => {
      warnings.push({
        line: 0,
        column: 0,
        message: `Possible undefined variable: ${varName}`,
        severity: 'warning',
        type: 'undefined_variable',
        suggestion: `Declare variable ${varName} with var, let, or const`
      });
    });
  }

  static checkPythonIndentation(code, lines, errors) {
    let expectedIndent = 0;
    const indentStack = [0];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const currentIndent = line.length - line.trimStart().length;
      const lastIndent = indentStack[indentStack.length - 1];

      if (currentIndent > lastIndent) {
        // Increased indentation
        indentStack.push(currentIndent);
      } else if (currentIndent < lastIndent) {
        // Decreased indentation
        while (indentStack.length > 0 && indentStack[indentStack.length - 1] > currentIndent) {
          indentStack.pop();
        }
        
        if (indentStack.length === 0 || indentStack[indentStack.length - 1] !== currentIndent) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: 'Unexpected indentation',
            severity: 'error',
            type: 'unexpected_indent',
            suggestion: 'Fix indentation to match previous levels'
          });
        }
      }

      // Check for mixed tabs and spaces in a more detailed way
      if (line.includes('\t') && line.includes(' ')) {
        const spaceCount = (line.match(/ /g) || []).length;
        const tabCount = (line.match(/\t/g) || []).length;
        if (spaceCount > 0 && tabCount > 0) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: 'Mixed tabs and spaces in indentation',
            severity: 'error',
            type: 'mixed_indentation',
            suggestion: 'Use either tabs or spaces consistently'
          });
        }
      }
    });
  }

  static checkUnclosedHtmlTags(code, errors) {
    const tagPattern = /<(\/?)(\w+)[^>]*>/g;
    const stack = [];
    let match;

    while ((match = tagPattern.exec(code)) !== null) {
      const [fullTag, isClosing, tagName] = match;
      const line = code.substring(0, match.index).split('\n').length;
      const column = match.index - code.lastIndexOf('\n', match.index - 1);

      if (!isClosing) {
        // Opening tag
        if (!this.isSelfClosingTag(tagName)) {
          stack.push({ tagName, line, column });
        }
      } else {
        // Closing tag
        const last = stack.pop();
        if (!last) {
          errors.push({
            line,
            column,
            message: `Unexpected closing tag: </${tagName}>`,
            severity: 'error',
            type: 'unexpected_closing_tag',
            suggestion: `Remove extra closing tag or add opening <${tagName}>`
          });
        } else if (last.tagName !== tagName) {
          errors.push({
            line,
            column,
            message: `Mismatched tags: expected </${last.tagName}> but found </${tagName}>`,
            severity: 'error',
            type: 'mismatched_tags',
            suggestion: `Change to </${last.tagName}> or fix opening tag`
          });
        }
      }
    }

    // Check for unclosed tags
    stack.forEach(({ tagName, line, column }) => {
      errors.push({
        line,
        column,
        message: `Unclosed tag: <${tagName}>`,
        severity: 'error',
        type: 'unclosed_tag',
        suggestion: `Add closing </${tagName}> tag`
      });
    });
  }

  static isSelfClosingTag(tagName) {
    const selfClosingTags = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    return selfClosingTags.includes(tagName.toLowerCase());
  }

  static isReservedWord(word) {
    const reservedWords = [
      'if', 'else', 'for', 'while', 'function', 'return', 'var', 'let', 'const',
      'class', 'import', 'export', 'default', 'this', 'new', 'typeof', 'instanceof',
      'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'console', 'log',
      'break', 'continue', 'switch', 'case', 'default', 'throw', 'try', 'catch',
      'finally', 'void', 'delete', 'in', 'of', 'yield', 'await', 'async', 'static'
    ];
    return reservedWords.includes(word);
  }

  static hasAssignmentInCondition(line) {
    return /if\s*\(.*=.*\)/.test(line) && !/if\s*\(.*===.*\)/.test(line);
  }

  static isMissingFunctionParentheses(line) {
    return /function\s+\w+(\s+)?[^{]/.test(line) && !/function\s+\w+\s*\(/.test(line);
  }

  static hasInvalidRegex(line) {
    try {
      // Basic regex validation
      if (line.includes('/') && !line.startsWith('//') && !line.startsWith('/*')) {
        const regexMatch = line.match(/\/(.*?)\/[gimuy]*/);
        if (regexMatch) {
          new RegExp(regexMatch[1]);
        }
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  static hasUnclosedTemplateLiteral(line, lines, index) {
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0) {
      // Check if it continues in next lines
      let currentIndex = index + 1;
      while (currentIndex < lines.length) {
        if (lines[currentIndex].includes('`')) {
          return false;
        }
        currentIndex++;
      }
      return true;
    }
    return false;
  }

  static isPythonMissingColon(line) {
    const colonRequiredPatterns = [
      /^def\s+\w+/,
      /^class\s+\w+/,
      /^if\s+/,
      /^elif\s+/,
      /^else\s*$/,
      /^for\s+\w+/,
      /^while\s+/,
      /^try\s*$/,
      /^except\s+/,
      /^finally\s*$/,
      /^with\s+/
    ];
    
    return colonRequiredPatterns.some(pattern => 
      pattern.test(line) && !line.trim().endsWith(':')
    );
  }

  static isJavaMissingReturnType(line) {
    return /(?:public|private|protected)\s+(?!class)(\w+\s+)*\w+\s*\([^)]*\)\s*\{/.test(line) &&
           !/(?:public|private|protected)\s+(void|int|String|boolean|char|byte|short|long|float|double)/.test(line);
  }

  static generateSummary(errors, warnings) {
    const errorCount = errors.length;
    const warningCount = warnings.length;
    
    if (errorCount === 0 && warningCount === 0) {
      return 'No syntax issues detected';
    }
    
    const parts = [];
    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount === 1 ? '' : 's'}`);
    }
    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount === 1 ? '' : 's'}`);
    }
    
    return parts.join(' and ');
  }
}

export default SyntaxErrorDetector;