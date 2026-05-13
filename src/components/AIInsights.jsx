import { useState } from 'react';
import {
  Brain, AlertTriangle, TrendingUp, CheckCircle, Shield, Package,
  Zap, ChevronRight, Sparkles, Target, Activity, Clock
} from 'lucide-react';
import { aiInsights } from '../data/dashboardData';
import './AIInsights.css';

const iconMap = {
  AlertTriangle, TrendingUp, CheckCircle, Shield, Package
};

const typeConfig = {
  critical: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'CRITICAL' },
  warning: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'WARNING' },
  info: { color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)', label: 'INFO' },
};

const priorityConfig = {
  urgent: { color: '#EF4444', label: 'Urgent' },
  high: { color: '#F59E0B', label: 'High' },
  medium: { color: '#06B6D4', label: 'Medium' },
  low: { color: '#10B981', label: 'Low' },
};

function ConfidenceBar({ confidence }) {
  return (
    <div className="ai-confidence">
      <div className="ai-confidence__label">
        <Sparkles size={12} />
        <span>AI Confidence</span>
      </div>
      <div className="ai-confidence__bar">
        <div 
          className="ai-confidence__fill" 
          style={{ 
            width: `${confidence}%`,
            background: confidence > 85 ? '#10B981' : confidence > 70 ? '#F59E0B' : '#EF4444'
          }} 
        />
      </div>
      <span className="ai-confidence__value">{confidence}%</span>
    </div>
  );
}

export default function AIInsights() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <section className="ai-section" id="ai-insights-section">
      <div className="ai-section__header">
        <div className="ai-section__title-area">
          <div className="ai-section__icon-wrapper">
            <Brain size={24} />
            <div className="ai-section__icon-glow" />
          </div>
          <div>
            <h2 className="ai-section__title">AI-Powered Insights</h2>
            <p className="ai-section__subtitle">
              Predictive analytics, risk analysis & automated recommendations
            </p>
          </div>
        </div>
        <div className="ai-section__badge">
          <Zap size={14} />
          <span>Powered by AI</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ai-summary-cards">
        <div className="ai-summary-card ai-summary-card--critical">
          <AlertTriangle size={18} />
          <div>
            <span className="ai-summary-card__value">2</span>
            <span className="ai-summary-card__label">Critical Alerts</span>
          </div>
        </div>
        <div className="ai-summary-card ai-summary-card--warning">
          <Activity size={18} />
          <div>
            <span className="ai-summary-card__value">4</span>
            <span className="ai-summary-card__label">Districts At Risk</span>
          </div>
        </div>
        <div className="ai-summary-card ai-summary-card--success">
          <Target size={18} />
          <div>
            <span className="ai-summary-card__value">11</span>
            <span className="ai-summary-card__label">Active Interventions</span>
          </div>
        </div>
        <div className="ai-summary-card ai-summary-card--info">
          <Sparkles size={18} />
          <div>
            <span className="ai-summary-card__value">89%</span>
            <span className="ai-summary-card__label">Avg. Confidence</span>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="ai-insights-list">
        {aiInsights.map((insight, index) => {
          const Icon = iconMap[insight.icon];
          const config = typeConfig[insight.type];
          const priority = priorityConfig[insight.priority];
          const isExpanded = expandedId === insight.id;

          return (
            <div 
              key={insight.id} 
              className={`ai-insight-card ${isExpanded ? 'ai-insight-card--expanded' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setExpandedId(isExpanded ? null : insight.id)}
            >
              <div className="ai-insight-card__main">
                <div className="ai-insight-card__icon" style={{ background: config.bg, color: config.color }}>
                  {Icon && <Icon size={18} />}
                </div>
                
                <div className="ai-insight-card__content">
                  <div className="ai-insight-card__top">
                    <span className="ai-insight-card__type" style={{ color: config.color, background: config.bg }}>
                      {config.label}
                    </span>
                    <span className="ai-insight-card__priority" style={{ color: priority.color }}>
                      ● {priority.label} Priority
                    </span>
                    <span className="ai-insight-card__time">
                      <Clock size={11} />
                      {insight.timestamp}
                    </span>
                  </div>
                  
                  <h4 className="ai-insight-card__title">{insight.title}</h4>
                  <p className="ai-insight-card__description">{insight.description}</p>
                  
                  <ConfidenceBar confidence={insight.confidence} />
                </div>

                <ChevronRight 
                  size={18} 
                  className={`ai-insight-card__arrow ${isExpanded ? 'ai-insight-card__arrow--rotated' : ''}`} 
                />
              </div>

              {isExpanded && (
                <div className="ai-insight-card__expanded-content">
                  <div className="ai-insight-card__recommendation">
                    <div className="ai-insight-card__rec-header">
                      <Sparkles size={14} />
                      <span>AI Recommendation</span>
                    </div>
                    <p>{insight.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
