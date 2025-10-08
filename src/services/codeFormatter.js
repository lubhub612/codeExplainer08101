// src/services/codeFormatter.js

export class CodeFormatter {
  static formatCode(code, language = 'javascript', options = {}) {
    if (!code || !code.trim()) {
      return code;
    }

    const defaultOptions = {
      indentSize: 2,
      useTabs: false,
      maxLineLength: 80,
      preserveBlankLines: true,
      ...options
    };

    try {
      switch (language) {
        case 'javascript':
        case 'typescript':
        case 'jsx':
        case 'tsx':
          return this.formatJavaScript(code, defaultOptions);
        case 'python':
          return this.formatPython(code, defaultOptions);
        case 'java':
          return this.formatJava(code, defaultOptions);
        case 'cpp':
        case 'c':
          return this.formatCpp(code, defaultOptions);
        case 'html':
          return this.formatHtml(code, defaultOptions);
        case 'css':
          return this.formatCss(code, defaultOptions);
        case 'json':
          return this.formatJson(code, defaultOptions);
        default:
          return this.formatGeneric(code, defaultOptions);
      }
    } catch (error) {
      console.warn('Formatting failed:', error);
      return code; // Return original code if formatting fails
    }
  }

  static formatJavaScript(code, options) {
    let formatted = code;
    
    // Basic JavaScript formatting rules
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixIndentation(formatted, options);
    formatted = this.normalizeSpacing(formatted);
    formatted = this.fixSemicolons(formatted);
    formatted = this.fixBracketSpacing(formatted);
    formatted = this.formatArrowFunctions(formatted);
    formatted = this.fixObjectLiterals(formatted);
    
    return formatted;
  }

  static formatPython(code, options) {
    let formatted = code;
    
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixPythonIndentation(formatted, options);
    formatted = this.normalizePythonSpacing(formatted);
    formatted = this.fixPythonImports(formatted);
    formatted = this.fixPythonQuotes(formatted);
    
    return formatted;
  }

  static formatJava(code, options) {
    let formatted = code;
    
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixIndentation(formatted, options);
    formatted = this.normalizeSpacing(formatted);
    formatted = this.fixSemicolons(formatted);
    formatted = this.fixBracketSpacing(formatted);
    formatted = this.fixJavaModifiers(formatted);
    
    return formatted;
  }

  static formatCpp(code, options) {
    let formatted = code;
    
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixIndentation(formatted, options);
    formatted = this.normalizeSpacing(formatted);
    formatted = this.fixSemicolons(formatted);
    formatted = this.fixBracketSpacing(formatted);
    formatted = this.fixIncludeDirectives(formatted);
    
    return formatted;
  }

  static formatHtml(code, options) {
    let formatted = code;
    
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixHtmlIndentation(formatted, options);
    formatted = this.normalizeHtmlSpacing(formatted);
    formatted = this.fixHtmlAttributes(formatted);
    formatted = this.fixSelfClosingTags(formatted);
    
    return formatted;
  }

  static formatCss(code, options) {
    let formatted = code;
    
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixCssIndentation(formatted, options);
    formatted = this.normalizeCssSpacing(formatted);
    formatted = this.fixCssSemicolons(formatted);
    formatted = this.fixCssBraces(formatted);
    
    return formatted;
  }

  static formatJson(code, options) {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, options.useTabs ? '\t' : options.indentSize);
    } catch {
      // If JSON is invalid, try to fix common issues
      return this.fixJson(code, options);
    }
  }

  static formatGeneric(code, options) {
    let formatted = code;
    
    formatted = this.normalizeLineEndings(formatted);
    formatted = this.fixIndentation(formatted, options);
    formatted = this.normalizeSpacing(formatted);
    
    return formatted;
  }

  // Helper Methods
  static normalizeLineEndings(code) {
    return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  static fixIndentation(code, options) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentString = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
    
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        return options.preserveBlankLines ? '' : null;
      }
      
      // Decrease indent for closing braces/brackets
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = indentString.repeat(indentLevel) + trimmed;
      
      // Increase indent for opening braces/brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || line.includes('{') && !line.includes('}')) {
        indentLevel++;
      }
      
      return indentedLine;
    }).filter(line => line !== null);
    
    return formattedLines.join('\n');
  }

  static fixPythonIndentation(code, options) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentString = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
    
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        return options.preserveBlankLines ? '' : null;
      }
      
      // Python-specific indentation rules
      if (trimmed.startsWith('except') || trimmed.startsWith('elif') || trimmed.startsWith('else')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = indentString.repeat(indentLevel) + trimmed;
      
      // Increase indent for Python blocks
      if (trimmed.endsWith(':') && 
          !trimmed.startsWith('#') && 
          !trimmed.includes('lambda') &&
          !trimmed.match(/'.*:'/) && 
          !trimmed.match(/".*:"/)) {
        indentLevel++;
      }
      
      return indentedLine;
    }).filter(line => line !== null);
    
    return formattedLines.join('\n');
  }

  static normalizeSpacing(code) {
    return code
      // Fix spacing around operators
      .replace(/([=+*\/%&|^!<>-])(?!=)/g, ' $1 ')
      .replace(/([=+*\/%&|^!<>-])=/g, '$1 =')
      // Fix multiple spaces
      .replace(/  +/g, ' ')
      // Fix spacing after commas
      .replace(/,(\S)/g, ', $1')
      // Fix spacing around braces
      .replace(/\s*{\s*/g, ' { ')
      .replace(/\s*}\s*/g, ' } ')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ')
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '')
      // Trim each line
      .split('\n').map(line => line.trim()).join('\n');
  }

  static normalizePythonSpacing(code) {
    return code
      // Fix spacing around operators
      .replace(/([=+*\/%&|^!<>-])(?!=)/g, ' $1 ')
      .replace(/([=+*\/%&|^!<>-])=/g, '$1 =')
      // Fix multiple spaces
      .replace(/  +/g, ' ')
      // Fix spacing after commas
      .replace(/,(\S)/g, ', $1')
      // Fix spacing around colons
      .replace(/\s*:\s*/g, ': ')
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '')
      // Trim each line
      .split('\n').map(line => line.trim()).join('\n');
  }

  static fixSemicolons(code) {
    const lines = code.split('\n');
    const formattedLines = lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || 
          trimmed.endsWith(';') || 
          trimmed.endsWith('{') || 
          trimmed.endsWith('}') ||
          trimmed.startsWith('//') ||
          trimmed.startsWith('/*') ||
          trimmed.startsWith('*') ||
          trimmed.startsWith('#') ||
          trimmed.includes('function') ||
          trimmed.includes('if') ||
          trimmed.includes('for') ||
          trimmed.includes('while') ||
          trimmed.endsWith(',') ||
          lines[index + 1]?.trim().startsWith('.')) {
        return line;
      }
      return line + ';';
    });
    
    return formattedLines.join('\n');
  }

  static fixBracketSpacing(code) {
    return code
      .replace(/\s*{\s*/g, ' { ')
      .replace(/\s*}\s*/g, ' } ')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ') ')
      .replace(/\s*\[\s*/g, ' [')
      .replace(/\s*\]\s*/g, '] ');
  }

  static formatArrowFunctions(code) {
    return code
      .replace(/\(\s*\)\s*=>/g, '() =>')
      .replace(/\(\s*(\w+)\s*\)\s*=>/g, '($1) =>')
      .replace(/(\w+)\s*=>/g, '$1 =>');
  }

  static fixObjectLiterals(code) {
    return code
      .replace(/\{\s*/g, '{\n')
      .replace(/\s*\}/g, '\n}')
      .replace(/,\s*/g, ',\n');
  }

  static fixPythonImports(code) {
    const lines = code.split('\n');
    const importLines = [];
    const otherLines = [];
    
    lines.forEach(line => {
      if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
        importLines.push(line);
      } else {
        otherLines.push(line);
      }
    });
    
    // Sort imports alphabetically
    importLines.sort();
    
    return [...importLines, ...otherLines].join('\n');
  }

  static fixPythonQuotes(code) {
    // Convert single quotes to double quotes (PEP8 recommendation)
    return code.replace(/'([^']*)'/g, '"$1"');
  }

  static fixJavaModifiers(code) {
    return code
      .replace(/(public|private|protected|static|final)\s+/g, '$1 ')
      .replace(/\s+(\{)/g, ' $1');
  }

  static fixIncludeDirectives(code) {
    return code.replace(/#include\s+<(.+)>/g, '#include <$1>');
  }

  static fixHtmlIndentation(code, options) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentString = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
    
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        return options.preserveBlankLines ? '' : null;
      }
      
      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = indentString.repeat(indentLevel) + trimmed;
      
      // Increase indent for opening tags (unless self-closing)
      if (trimmed.startsWith('<') && 
          !trimmed.endsWith('/>') && 
          !trimmed.includes('</') && 
          !trimmed.match(/<(\w+)[^>]*>[^>]*<\/\1>/)) {
        indentLevel++;
      }
      
      return indentedLine;
    }).filter(line => line !== null);
    
    return formattedLines.join('\n');
  }

  static normalizeHtmlSpacing(code) {
    return code
      .replace(/\s+</g, '<')
      .replace(/>\s+/g, '>')
      .replace(/\s*=\s*/g, '=');
  }

  static fixHtmlAttributes(code) {
    return code
      .replace(/(\w+)\s*=\s*"([^"]*)"/g, '$1="$2"')
      .replace(/(\w+)\s*=\s*'([^']*)'/g, "$1='$2'");
  }

  static fixSelfClosingTags(code) {
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'base', 'area', 'col', 'command', 'embed', 'keygen', 'param', 'source', 'track', 'wbr'];
    
    selfClosingTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*)>`, 'gi');
      code = code.replace(regex, `<${tag}$1 />`);
    });
    
    return code;
  }

  static fixCssIndentation(code, options) {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentString = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
    
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        return options.preserveBlankLines ? '' : null;
      }
      
      // Decrease indent for closing braces
      if (trimmed === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = indentString.repeat(indentLevel) + trimmed;
      
      // Increase indent after opening brace
      if (trimmed.endsWith('{')) {
        indentLevel++;
      }
      
      return indentedLine;
    }).filter(line => line !== null);
    
    return formattedLines.join('\n');
  }

  static normalizeCssSpacing(code) {
    return code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/\s*;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/\s*:\s*/g, ': ')
      .replace(/  +/g, ' ');
  }

  static fixCssSemicolons(code) {
    const lines = code.split('\n');
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') &&
          trimmed.includes(':') &&
          !trimmed.startsWith('/*') &&
          !trimmed.endsWith('*/')) {
        return line + ';';
      }
      return line;
    });
    
    return formattedLines.join('\n');
  }

  static fixCssBraces(code) {
    return code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/\s*}\s*/g, '\n}\n')
      .replace(/;\s*}/g, ';\n}');
  }

  static fixJson(code, options) {
    // Try to fix common JSON issues
    let fixed = code
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix keys
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Fix string values
      .replace(/(\w+)(?=\s*:)/g, '"$1"'); // Add quotes to unquoted keys
    
    try {
      const parsed = JSON.parse(fixed);
      return JSON.stringify(parsed, null, options.useTabs ? '\t' : options.indentSize);
    } catch {
      return code; // Return original if still invalid
    }
  }

  static detectLanguage(code) {
    // Simple language detection for formatting
    if (code.includes('<html') || code.includes('<div') || code.match(/<[a-z][^>]*>/)) {
      return 'html';
    }
    if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
      return 'javascript';
    }
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
      return 'python';
    }
    if (code.includes('public class') || code.includes('System.out.println')) {
      return 'java';
    }
    if (code.includes('#include') || code.includes('std::')) {
      return 'cpp';
    }
    if (code.includes('{') && code.includes('}') && code.includes(':')) {
      return 'css';
    }
    if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
      return 'json';
    }
    return 'javascript'; // default
  }

  static getSupportedLanguages() {
    return [
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'c',
      'html',
      'css',
      'json',
      'jsx',
      'tsx'
    ];
  }

  static validateCode(code, language) {
    const issues = [];
    
    if (!code || !code.trim()) {
      return { isValid: true, issues: [] };
    }
    
    // Basic validation checks
    if (language === 'json') {
      try {
        JSON.parse(code);
      } catch (error) {
        issues.push({
          type: 'invalid_json',
          message: 'Invalid JSON format',
          suggestion: 'Check for syntax errors like missing quotes or commas'
        });
      }
    }
    
    // Check for unbalanced brackets
    const bracketStack = [];
    const brackets = { '(': ')', '[': ']', '{': '}' };
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (brackets[char]) {
        bracketStack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = bracketStack.pop();
        if (!last || brackets[last] !== char) {
          issues.push({
            type: 'unbalanced_brackets',
            message: `Unbalanced bracket: ${char}`,
            suggestion: 'Check for matching opening and closing brackets'
          });
        }
      }
    }
    
    if (bracketStack.length > 0) {
      issues.push({
        type: 'unclosed_brackets',
        message: 'Unclosed brackets detected',
        suggestion: 'Add closing brackets for all opened brackets'
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default CodeFormatter;