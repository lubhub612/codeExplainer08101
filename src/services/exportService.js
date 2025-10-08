// src/services/exportService.js

export const exportFormats = {
  PDF: 'pdf',
  MARKDOWN: 'markdown',
  HTML: 'html',
  TEXT: 'text',
  JSON: 'json'
};

export class ExportService {
  static generateMarkdown(code, explanations, language, filename = 'code') {
    const title = `# Code Explanation: ${filename}\n\n`;
    const langInfo = `**Language:** ${language}\n`;
    const timestamp = `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    let content = title + langInfo + timestamp;
    
    // Code section
    content += '## Code\n```' + language + '\n' + code + '\n```\n\n';
    
    // Explanations section
    content += '## Line-by-Line Explanations\n\n';
    
    explanations.forEach(item => {
      if (item.code.trim()) {
        content += `### Line ${item.lineNumber}\n`;
        content += '```' + language + '\n' + item.code + '\n```\n';
        content += `**Explanation:** ${item.explanation}\n\n`;
      }
    });
    
    // Statistics
    const totalLines = explanations.length;
    const codeLines = explanations.filter(item => item.code.trim()).length;
    const emptyLines = totalLines - codeLines;
    
    content += '## Statistics\n';
    content += `- Total Lines: ${totalLines}\n`;
    content += `- Code Lines: ${codeLines}\n`;
    content += `- Empty Lines: ${emptyLines}\n`;
    content += `- File: ${filename}\n`;
    
    return content;
  }

  static generateHTML(code, explanations, language, filename = 'code') {
    const title = `<h1>Code Explanation: ${filename}</h1>`;
    const langInfo = `<p><strong>Language:</strong> ${language}</p>`;
    const timestamp = `<p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>`;
    
    let content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Explanation: ${filename}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 20px; 
            color: #333;
        }
        .header { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px;
            border-left: 4px solid #007bff;
        }
        .code-block { 
            background: #f8f9fa; 
            border: 1px solid #e9ecef; 
            border-radius: 6px; 
            padding: 16px; 
            margin: 10px 0; 
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }
        .explanation { 
            background: #e8f4fd; 
            border-left: 4px solid #007bff; 
            padding: 12px 16px; 
            margin: 8px 0; 
            border-radius: 4px;
        }
        .line-number { 
            color: #6c757d; 
            font-weight: bold; 
            margin-right: 10px;
        }
        .stats { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 6px; 
            margin-top: 20px;
        }
        .empty-line { 
            color: #6c757d; 
            font-style: italic; 
        }
        h2 { 
            color: #2c3e50; 
            border-bottom: 2px solid #f0f0f0; 
            padding-bottom: 8px; 
        }
        h3 { 
            color: #34495e; 
            margin-top: 20px; 
        }
    </style>
</head>
<body>
    <div class="header">
        ${title}
        ${langInfo}
        ${timestamp}
    </div>
`;

    // Code section
    content += '<h2>Code</h2>';
    content += `<div class="code-block"><pre>${this.escapeHtml(code)}</pre></div>`;
    
    // Explanations section
    content += '<h2>Line-by-Line Explanations</h2>';
    
    explanations.forEach(item => {
      if (item.code.trim()) {
        content += `<h3>Line ${item.lineNumber}</h3>`;
        content += `<div class="code-block"><pre>${this.escapeHtml(item.code)}</pre></div>`;
        content += `<div class="explanation"><strong>Explanation:</strong> ${this.escapeHtml(item.explanation)}</div>`;
      }
    });
    
    // Statistics
    const totalLines = explanations.length;
    const codeLines = explanations.filter(item => item.code.trim()).length;
    const emptyLines = totalLines - codeLines;
    
    content += '<h2>Statistics</h2>';
    content += `<div class="stats">
        <p><strong>Total Lines:</strong> ${totalLines}</p>
        <p><strong>Code Lines:</strong> ${codeLines}</p>
        <p><strong>Empty Lines:</strong> ${emptyLines}</p>
        <p><strong>File:</strong> ${filename}</p>
    </div>`;
    
    content += `
</body>
</html>`;
    
    return content;
  }

  static generateText(code, explanations, language, filename = 'code') {
    let content = `CODE EXPLANATION: ${filename}\n`;
    content += `Language: ${language}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += '='.repeat(50) + '\n\n';
    
    content += 'CODE:\n';
    content += '-'.repeat(30) + '\n';
    content += code + '\n\n';
    
    content += 'LINE-BY-LINE EXPLANATIONS:\n';
    content += '-'.repeat(40) + '\n\n';
    
    explanations.forEach(item => {
      if (item.code.trim()) {
        content += `Line ${item.lineNumber}:\n`;
        content += `Code: ${item.code}\n`;
        content += `Explanation: ${item.explanation}\n\n`;
      }
    });
    
    const totalLines = explanations.length;
    const codeLines = explanations.filter(item => item.code.trim()).length;
    const emptyLines = totalLines - codeLines;
    
    content += 'STATISTICS:\n';
    content += '-'.repeat(20) + '\n';
    content += `Total Lines: ${totalLines}\n`;
    content += `Code Lines: ${codeLines}\n`;
    content += `Empty Lines: ${emptyLines}\n`;
    content += `File: ${filename}\n`;
    
    return content;
  }

  static generateJSON(code, explanations, language, filename = 'code') {
    const exportData = {
      metadata: {
        filename,
        language,
        generated: new Date().toISOString(),
        version: '1.0'
      },
      code,
      explanations: explanations.map(item => ({
        lineNumber: item.lineNumber,
        code: item.code,
        explanation: item.explanation,
        isEmpty: item.code.trim() === ''
      })),
      statistics: {
        totalLines: explanations.length,
        codeLines: explanations.filter(item => item.code.trim()).length,
        emptyLines: explanations.filter(item => item.code.trim() === '').length
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static downloadContent(content, filename, format) {
    const blob = new Blob([content], { 
      type: this.getMimeType(format) 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static getMimeType(format) {
    const mimeTypes = {
      [exportFormats.MARKDOWN]: 'text/markdown',
      [exportFormats.HTML]: 'text/html',
      [exportFormats.TEXT]: 'text/plain',
      [exportFormats.JSON]: 'application/json',
      [exportFormats.PDF]: 'application/pdf'
    };
    
    return mimeTypes[format] || 'text/plain';
  }

  static getFileExtension(format) {
    const extensions = {
      [exportFormats.MARKDOWN]: 'md',
      [exportFormats.HTML]: 'html',
      [exportFormats.TEXT]: 'txt',
      [exportFormats.JSON]: 'json',
      [exportFormats.PDF]: 'pdf'
    };
    
    return extensions[format] || 'txt';
  }

  static generateFilename(baseName, format, language) {
    const extension = this.getFileExtension(format);
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${baseName}-${language}-${timestamp}.${extension}`;
  }
}