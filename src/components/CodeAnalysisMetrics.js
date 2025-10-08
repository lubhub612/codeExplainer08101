// src/components/CodeAnalysisMetrics.js
import React, { useState, useMemo } from 'react';
import CodeAnalysis from '../services/codeAnalysis';
import { useTheme } from '../contexts/ThemeContext';
import './CodeAnalysisMetrics.css';

export const CodeAnalysisMetrics = ({ code, language = 'javascript', isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDarkMode } = useTheme();

  const analysis = useMemo(() => {
    return CodeAnalysis.analyzeCode(code, language);
  }, [code, language]);

  if (!isOpen) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#6b7280';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`modal-overlay ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`analysis-modal ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="modal-header">
          <h2>📊 Code Analysis Metrics</h2>
          <button 
            className="close-modal"
            onClick={onClose}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <div className="analysis-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'complexity' ? 'active' : ''}`}
            onClick={() => setActiveTab('complexity')}
          >
            🧩 Complexity
          </button>
          <button 
            className={`tab-button ${activeTab === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveTab('quality')}
          >
            🎯 Quality
          </button>
          <button 
            className={`tab-button ${activeTab === 'structure' ? 'active' : ''}`}
            onClick={() => setActiveTab('structure')}
          >
            🏗️ Structure
          </button>
          <button 
            className={`tab-button ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            ⚠️ Issues
          </button>
        </div>

        <div className="analysis-content">
          {activeTab === 'overview' && <OverviewTab analysis={analysis} getScoreColor={getScoreColor} />}
          {activeTab === 'complexity' && <ComplexityTab analysis={analysis} getScoreColor={getScoreColor} />}
          {activeTab === 'quality' && <QualityTab analysis={analysis} getScoreColor={getScoreColor} />}
          {activeTab === 'structure' && <StructureTab analysis={analysis} />}
          {activeTab === 'issues' && <IssuesTab analysis={analysis} getSeverityColor={getSeverityColor} />}
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

// Tab Components
const OverviewTab = ({ analysis, getScoreColor }) => (
  <div className="overview-tab">
    <div className="overview-header">
      <div className="overall-score">
        <div 
          className="score-circle"
          style={{ 
            background: `conic-gradient(${getScoreColor(analysis.overall)} ${analysis.overall * 3.6}deg, #e5e7eb 0deg)` 
          }}
        >
          <span className="score-value">{analysis.overall}</span>
        </div>
        <div className="score-label">Overall Score</div>
        <div className="score-description">
          {analysis.overall >= 80 ? 'Excellent code quality' :
           analysis.overall >= 60 ? 'Good code quality' :
           analysis.overall >= 40 ? 'Fair code quality' : 'Needs improvement'}
        </div>
      </div>
      
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-value">{analysis.basic.codeLines}</span>
          <span className="stat-label">Code Lines</span>
        </div>
        <div className="quick-stat">
          <span className="stat-value">{analysis.complexity.cyclomaticComplexity}</span>
          <span className="stat-label">Complexity</span>
        </div>
        <div className="quick-stat">
          <span className="stat-value">{analysis.issues.totalIssues}</span>
          <span className="stat-label">Issues</span>
        </div>
        <div className="quick-stat">
          <span className="stat-value">{analysis.structure.functions}</span>
          <span className="stat-label">Functions</span>
        </div>
      </div>
    </div>

    <div className="metric-grid">
      <MetricCard 
        title="Maintainability"
        value={analysis.quality.maintainabilityIndex}
        max={100}
        color={getScoreColor(analysis.quality.maintainabilityIndex)}
        description="How easy it is to maintain and modify"
      />
      <MetricCard 
        title="Readability"
        value={analysis.quality.readabilityScore}
        max={100}
        color={getScoreColor(analysis.quality.readabilityScore)}
        description="How easy it is to read and understand"
      />
      <MetricCard 
        title="Structure"
        value={analysis.structure.structureScore}
        max={100}
        color={getScoreColor(analysis.structure.structureScore)}
        description="Code organization and structure quality"
      />
      <MetricCard 
        title="Complexity"
        value={Math.max(0, 100 - analysis.complexity.cyclomaticComplexity * 5)}
        max={100}
        color={getScoreColor(Math.max(0, 100 - analysis.complexity.cyclomaticComplexity * 5))}
        description="Inverse complexity score"
      />
    </div>
  </div>
);

const ComplexityTab = ({ analysis, getScoreColor }) => (
  <div className="complexity-tab">
    <h3>Complexity Analysis</h3>
    
    <div className="complexity-metrics">
      <div className="complexity-metric">
        <span className="metric-label">Cyclomatic Complexity</span>
        <span className="metric-value">{analysis.complexity.cyclomaticComplexity}</span>
        <span className={`metric-level ${analysis.complexity.complexityLevel.toLowerCase().replace(' ', '-')}`}>
          {analysis.complexity.complexityLevel}
        </span>
      </div>
      
      <div className="complexity-metric">
        <span className="metric-label">Control Structures</span>
        <span className="metric-value">{analysis.complexity.controlStructures}</span>
      </div>
      
      <div className="complexity-metric">
        <span className="metric-label">Maximum Nesting</span>
        <span className="metric-value">{analysis.complexity.maxNesting}</span>
        <span className={`metric-level ${analysis.complexity.maxNesting > 3 ? 'high' : 'low'}`}>
          {analysis.complexity.maxNesting > 3 ? 'Deep' : 'Good'}
        </span>
      </div>
    </div>

    <div className="complexity-tips">
      <h4>Complexity Tips:</h4>
      <ul>
        {analysis.complexity.cyclomaticComplexity > 10 && (
          <li>🔍 Consider breaking down complex functions into smaller ones</li>
        )}
        {analysis.complexity.maxNesting > 3 && (
          <li>🔄 Reduce nested conditions by using guard clauses</li>
        )}
        {analysis.complexity.controlStructures > 8 && (
          <li>🎯 Extract complex logic into separate functions</li>
        )}
        {analysis.complexity.cyclomaticComplexity <= 5 && (
          <li>✅ Good complexity level - keep it simple!</li>
        )}
      </ul>
    </div>
  </div>
);

const QualityTab = ({ analysis, getScoreColor }) => (
  <div className="quality-tab">
    <h3>Code Quality Assessment</h3>
    
    <div className="quality-scores">
      <div className="quality-score">
        <div className="score-header">
          <span>Maintainability Index</span>
          <span className="score-value" style={{ color: getScoreColor(analysis.quality.maintainabilityIndex) }}>
            {analysis.quality.maintainabilityIndex}/100
          </span>
        </div>
        <div className="score-bar">
          <div 
            className="score-fill"
            style={{ 
              width: `${analysis.quality.maintainabilityIndex}%`,
              backgroundColor: getScoreColor(analysis.quality.maintainabilityIndex)
            }}
          ></div>
        </div>
      </div>
      
      <div className="quality-score">
        <div className="score-header">
          <span>Readability Score</span>
          <span className="score-value" style={{ color: getScoreColor(analysis.quality.readabilityScore) }}>
            {analysis.quality.readabilityScore}/100
          </span>
        </div>
        <div className="score-bar">
          <div 
            className="score-fill"
            style={{ 
              width: `${analysis.quality.readabilityScore}%`,
              backgroundColor: getScoreColor(analysis.quality.readabilityScore)
            }}
          ></div>
        </div>
      </div>
    </div>

    <div className="quality-assessment">
      <h4>Quality Level: <span style={{ color: getScoreColor(analysis.overall) }}>
        {analysis.quality.qualityLevel}
      </span></h4>
      
      <div className="quality-tips">
        <h5>Recommendations:</h5>
        <ul>
          {analysis.quality.maintainabilityIndex < 60 && (
            <li>📝 Add comments to improve maintainability</li>
          )}
          {analysis.quality.readabilityScore < 60 && (
            <li>✨ Break long lines and use descriptive names</li>
          )}
          {analysis.basic.commentRatio < 0.1 && (
            <li>💬 Consider adding more comments (current: {Math.round(analysis.basic.commentRatio * 100)}%)</li>
          )}
          {analysis.basic.averageLineLength > 80 && (
            <li>📏 Some lines are too long (avg: {Math.round(analysis.basic.averageLineLength)} chars)</li>
          )}
        </ul>
      </div>
    </div>
  </div>
);

const StructureTab = ({ analysis }) => (
  <div className="structure-tab">
    <h3>Code Structure Analysis</h3>
    
    <div className="structure-metrics">
      <div className="structure-grid">
        <div className="structure-item">
          <span className="structure-icon">📊</span>
          <span className="structure-value">{analysis.structure.functions}</span>
          <span className="structure-label">Functions</span>
        </div>
        <div className="structure-item">
          <span className="structure-icon">🏛️</span>
          <span className="structure-value">{analysis.structure.classes}</span>
          <span className="structure-label">Classes</span>
        </div>
        <div className="structure-item">
          <span className="structure-icon">📦</span>
          <span className="structure-value">{analysis.structure.imports}</span>
          <span className="structure-label">Imports</span>
        </div>
        <div className="structure-item">
          <span className="structure-icon">📏</span>
          <span className="structure-value">{Math.round(analysis.structure.avgFunctionLength)}</span>
          <span className="structure-label">Avg Function Lines</span>
        </div>
      </div>
    </div>

    <div className="structure-assessment">
      <h4>Structure Assessment:</h4>
      <ul>
        {analysis.structure.functions === 0 && analysis.basic.codeLines > 10 && (
          <li>🔧 Consider organizing code into functions</li>
        )}
        {analysis.structure.avgFunctionLength > 30 && (
          <li>✂️ Some functions might be too long - consider breaking them down</li>
        )}
        {analysis.structure.functions > 0 && analysis.structure.avgFunctionLength <= 15 && (
          <li>✅ Good function size distribution</li>
        )}
        {analysis.structure.hasMainFunction && (
          <li>🎯 Contains main entry point</li>
        )}
      </ul>
    </div>
  </div>
);

const IssuesTab = ({ analysis, getSeverityColor }) => (
  <div className="issues-tab">
    <h3>Code Issues & Suggestions</h3>
    
    <div className="issues-summary">
      <div className="issues-stats">
        <div className="issue-stat" style={{ color: getSeverityColor('high') }}>
          <span className="stat-count">{analysis.issues.bySeverity.high}</span>
          <span className="stat-label">High</span>
        </div>
        <div className="issue-stat" style={{ color: getSeverityColor('medium') }}>
          <span className="stat-count">{analysis.issues.bySeverity.medium}</span>
          <span className="stat-label">Medium</span>
        </div>
        <div className="issue-stat" style={{ color: getSeverityColor('low') }}>
          <span className="stat-count">{analysis.issues.bySeverity.low}</span>
          <span className="stat-label">Low</span>
        </div>
      </div>
    </div>

    {analysis.issues.totalIssues > 0 ? (
      <div className="issues-list">
        <h4>Detected Issues:</h4>
        {analysis.issues.issues.map((issue, index) => (
          <div key={index} className="issue-item" style={{ borderLeftColor: getSeverityColor(issue.severity) }}>
            <div className="issue-header">
              <span className="issue-type">{issue.type.replace('_', ' ')}</span>
              <span 
                className="issue-severity"
                style={{ color: getSeverityColor(issue.severity) }}
              >
                {issue.severity}
              </span>
            </div>
            <div className="issue-message">{issue.message}</div>
            {issue.line > 0 && (
              <div className="issue-line">Line: {issue.line}</div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="no-issues">
        <span className="no-issues-icon">✅</span>
        <h4>No issues detected!</h4>
        <p>Your code looks clean and well-structured.</p>
      </div>
    )}
  </div>
);

const MetricCard = ({ title, value, max, color, description }) => (
  <div className="metric-card">
    <div className="metric-header">
      <span className="metric-title">{title}</span>
      <span className="metric-value" style={{ color }}>{value}/{max}</span>
    </div>
    <div className="metric-bar">
      <div 
        className="metric-fill"
        style={{ 
          width: `${(value / max) * 100}%`,
          backgroundColor: color
        }}
      ></div>
    </div>
    <div className="metric-description">{description}</div>
  </div>
);

export default CodeAnalysisMetrics;