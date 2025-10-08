// src/components/ExportOptions.js
import React, { useState } from 'react';
import { ExportService, exportFormats } from '../services/exportService';
import { useTheme } from '../contexts/ThemeContext';

export const ExportOptions = ({ 
  code, 
  explanations, 
  language, 
  filename = 'code',
  isOpen, 
  onClose 
}) => {
  const [exportFormat, setExportFormat] = useState(exportFormats.MARKDOWN);
  const [includeCode, setIncludeCode] = useState(true);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { isDarkMode } = useTheme();

  const handleExport = async () => {
    if (!code.trim() || explanations.length === 0) {
      alert('No code or explanations to export');
      return;
    }

    setIsExporting(true);

    try {
      let content;
      const baseFilename = filename.replace(/\.[^/.]+$/, "") || 'code';

      switch (exportFormat) {
        case exportFormats.MARKDOWN:
          content = ExportService.generateMarkdown(
            code, 
            explanations, 
            language, 
            baseFilename
          );
          break;
          
        case exportFormats.HTML:
          content = ExportService.generateHTML(
            code, 
            explanations, 
            language, 
            baseFilename
          );
          break;
          
        case exportFormats.TEXT:
          content = ExportService.generateText(
            code, 
            explanations, 
            language, 
            baseFilename
          );
          break;
          
        case exportFormats.JSON:
          content = ExportService.generateJSON(
            code, 
            explanations, 
            language, 
            baseFilename
          );
          break;
          
        case exportFormats.PDF:
          await exportToPDF(code, explanations, language, baseFilename);
          break;
          
        default:
          content = ExportService.generateText(
            code, 
            explanations, 
            language, 
            baseFilename
          );
      }

      if (content) {
        const exportFilename = ExportService.generateFilename(
          baseFilename, 
          exportFormat, 
          language
        );
        
        ExportService.downloadContent(content, exportFilename, exportFormat);
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async (code, explanations, language, filename) => {
    // For PDF, we'll generate HTML first and use browser's print to PDF
    const htmlContent = ExportService.generateHTML(code, explanations, language, filename);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
        onClose();
      }, 1000);
    };
  };

  const formatOptions = [
    { value: exportFormats.MARKDOWN, label: '📝 Markdown (.md)', description: 'Best for documentation' },
    { value: exportFormats.HTML, label: '🌐 HTML (.html)', description: 'Web-friendly format' },
    { value: exportFormats.TEXT, label: '📄 Plain Text (.txt)', description: 'Simple text format' },
    { value: exportFormats.JSON, label: '🔧 JSON (.json)', description: 'Structured data format' },
    { value: exportFormats.PDF, label: '📊 PDF (.pdf)', description: 'Print-friendly format' }
  ];

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`export-modal ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="modal-header">
          <h2>📤 Export Code Explanation</h2>
          <button 
            className="close-modal"
            onClick={onClose}
            title="Close (Esc)"
            disabled={isExporting}
          >
            ×
          </button>
        </div>

        <div className="export-content">
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-options">
              {formatOptions.map(option => (
                <label key={option.value} className="format-option">
                  <input
                    type="radio"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={(e) => setExportFormat(e.target.value)}
                    disabled={isExporting}
                  />
                  <div className="format-info">
                    <div className="format-label">{option.label}</div>
                    <div className="format-description">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Content Options</h3>
            <div className="content-options">
              <label className="content-option">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  disabled={isExporting}
                />
                <span>Include original code</span>
              </label>
              
              <label className="content-option">
                <input
                  type="checkbox"
                  checked={includeExplanations}
                  onChange={(e) => setIncludeExplanations(e.target.checked)}
                  disabled={isExporting}
                />
                <span>Include line-by-line explanations</span>
              </label>
              
              <label className="content-option">
                <input
                  type="checkbox"
                  checked={includeStatistics}
                  onChange={(e) => setIncludeStatistics(e.target.checked)}
                  disabled={isExporting}
                />
                <span>Include statistics</span>
              </label>
            </div>
          </div>

          <div className="export-section">
            <h3>Preview</h3>
            <div className="export-preview">
              <div className="preview-info">
                <span><strong>File:</strong> {ExportService.generateFilename(
                  filename.replace(/\.[^/.]+$/, "") || 'code', 
                  exportFormat, 
                  language
                )}</span>
                <span><strong>Format:</strong> {exportFormat.toUpperCase()}</span>
                <span><strong>Size:</strong> {explanations.length} lines</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="export-actions">
            <button
              className={`btn btn-secondary ${isDarkMode ? 'dark' : 'light'}`}
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              className={`btn btn-primary ${isExporting ? 'loading' : ''}`}
              onClick={handleExport}
              disabled={isExporting || !code.trim()}
            >
              {isExporting ? (
                <>
                  <span className="loading-spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;