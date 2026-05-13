import { useState } from 'react';
import {
  FileText, MapPin, Clock, User, CheckCircle, AlertTriangle,
  BookOpen, Package, Shield, Filter, ChevronRight, Activity
} from 'lucide-react';
import { fieldReports } from '../data/dashboardData';
import './FieldReports.css';

const typeConfig = {
  clinic_visit: { icon: Activity, color: '#14B8A6', label: 'Clinic Visit' },
  emergency: { icon: AlertTriangle, color: '#EF4444', label: 'Emergency' },
  education: { icon: BookOpen, color: '#8B5CF6', label: 'Education' },
  supply: { icon: Package, color: '#06B6D4', label: 'Supply Chain' },
  gbv_response: { icon: Shield, color: '#F59E0B', label: 'GBV Response' },
};

const statusConfig = {
  verified: { color: '#10B981', label: 'Verified' },
  completed: { color: '#06B6D4', label: 'Completed' },
  in_progress: { color: '#F59E0B', label: 'In Progress' },
  resolved: { color: '#14B8A6', label: 'Resolved' },
};

export default function FieldReports() {
  const [filterType, setFilterType] = useState('all');

  const filteredReports = filterType === 'all'
    ? fieldReports
    : fieldReports.filter(r => r.type === filterType);

  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <section className="field-section" id="field-reports-section">
      <div className="field-section__header">
        <div>
          <h2 className="field-section__title">
            <FileText size={22} className="field-section__title-icon" />
            Community & Field Reports
          </h2>
          <p className="field-section__subtitle">
            Real-time field officer submissions, emergency reports & community updates
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="field-filters">
        <button
          className={`field-filter-btn ${filterType === 'all' ? 'field-filter-btn--active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Reports
        </button>
        {Object.entries(typeConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              className={`field-filter-btn ${filterType === key ? 'field-filter-btn--active' : ''}`}
              onClick={() => setFilterType(key)}
              style={{ '--filter-color': config.color }}
            >
              <Icon size={14} />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="field-timeline">
        {filteredReports.map((report, index) => {
          const config = typeConfig[report.type];
          const status = statusConfig[report.status];
          const Icon = config.icon;

          return (
            <div 
              key={report.id} 
              className="field-report-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline connector */}
              <div className="field-report-card__timeline">
                <div className="field-report-card__dot" style={{ background: config.color }}>
                  <Icon size={14} />
                </div>
                {index < filteredReports.length - 1 && (
                  <div className="field-report-card__line" />
                )}
              </div>

              {/* Card Content */}
              <div className="field-report-card__body">
                <div className="field-report-card__header">
                  <div className="field-report-card__meta">
                    <span className="field-report-card__type" style={{ color: config.color, background: `${config.color}15` }}>
                      {config.label}
                    </span>
                    <span className="field-report-card__status" style={{ color: status.color }}>
                      ● {status.label}
                    </span>
                  </div>
                  <div className="field-report-card__datetime">
                    <Clock size={12} />
                    <span>{formatDate(report.timestamp)} · {formatTime(report.timestamp)}</span>
                  </div>
                </div>

                <h4 className="field-report-card__title">{report.title}</h4>
                <p className="field-report-card__description">{report.description}</p>

                <div className="field-report-card__footer">
                  <div className="field-report-card__officer">
                    <div className="field-report-card__avatar">
                      <User size={14} />
                    </div>
                    <div>
                      <span className="field-report-card__officer-name">{report.officer}</span>
                      <span className="field-report-card__officer-role">{report.role} · {report.district}</span>
                    </div>
                  </div>

                  <div className="field-report-card__metrics">
                    <div className="field-report-card__metric">
                      <span className="field-report-card__metric-value">{report.metrics.served}</span>
                      <span className="field-report-card__metric-label">Served</span>
                    </div>
                    <div className="field-report-card__metric">
                      <span className="field-report-card__metric-value">{report.metrics.referrals}</span>
                      <span className="field-report-card__metric-label">Referrals</span>
                    </div>
                    {report.metrics.emergencies > 0 && (
                      <div className="field-report-card__metric field-report-card__metric--emergency">
                        <span className="field-report-card__metric-value">{report.metrics.emergencies}</span>
                        <span className="field-report-card__metric-label">Emergencies</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="field-report-card__location">
                  <MapPin size={12} />
                  <span>{report.location.lat.toFixed(3)}, {report.location.lng.toFixed(3)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
