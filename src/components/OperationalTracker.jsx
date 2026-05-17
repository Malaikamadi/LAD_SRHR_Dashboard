import { useState, useMemo } from 'react';
import { Wallet, Filter, CheckCircle, Clock, AlertTriangle, CircleDot, Package, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useData } from '../context/DataContext';
import './ProcurementTracker.css';

const statusCfg = {
  complete: { icon: CheckCircle,   color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Complete' },
  ongoing:  { icon: Clock,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Ongoing'  },
  pending:  { icon: CircleDot,     color: '#64748B', bg: 'rgba(100,116,139,0.1)', label: 'Pending'  },
  overdue:  { icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Overdue'  },
};

const ENTITY_COLORS = {
  SLeSHI: '#14B8A6', RCH: '#8B5CF6', PHC: '#06B6D4', NEMS: '#EF4444',
  NMSA: '#10B981', COMAHS: '#F97316', Gender: '#EC4899', DPPI: '#F59E0B',
  Postgraduate: '#6366F1', 'Donor Coord.': '#3B82F6',
};

function ProgressRing({ pct, color, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="proc-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" style={{ fontSize: '0.7rem', fontWeight: 700, fill: '#334155' }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function OperationalTracker() {
  const { operational } = useData();
  const operationalData = Array.isArray(operational) ? operational : [];

  const [filterEntity, setFilterEntity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const entities = [...new Set(operationalData.map((p) => p.entity))].filter(Boolean);
  const filtered = operationalData.filter((p) => {
    if (filterEntity !== 'all' && p.entity !== filterEntity) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const totalAmount = operationalData.reduce((s, p) => s + (p.amountReq || 0), 0);
  const completedAmount = operationalData.filter((p) => p.status === 'complete').reduce((s, p) => s + (p.amountReq || 0), 0);
  const counts = {
    complete: operationalData.filter((p) => p.status === 'complete').length,
    ongoing:  operationalData.filter((p) => p.status === 'ongoing').length,
    pending:  operationalData.filter((p) => p.status === 'pending').length,
    overdue:  operationalData.filter((p) => p.status === 'overdue').length,
  };
  const completionRate = operationalData.length ? Math.round((counts.complete / operationalData.length) * 100) : 0;
  const disbursementRate = totalAmount ? Math.round((completedAmount / totalAmount) * 100) : 0;

  const statusPie = useMemo(() => [
    { name: 'Complete', value: counts.complete, color: '#10B981' },
    { name: 'Ongoing',  value: counts.ongoing,  color: '#F59E0B' },
    { name: 'Pending',  value: counts.pending,  color: '#94A3B8' },
    { name: 'Overdue',  value: counts.overdue,  color: '#EF4444' },
  ], [counts]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    operationalData.forEach((p) => {
      const key = p.category || 'Uncategorised';
      if (!map[key]) map[key] = { category: key, count: 0, amount: 0 };
      map[key].count += 1;
      map[key].amount += (p.amountReq || 0);
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount).slice(0, 8);
  }, [operationalData]);

  if (!operationalData.length) {
    return (
      <section className="proc-section">
        <div className="proc-section__header">
          <div>
            <h2 className="proc-section__title"><Wallet size={20} className="proc-section__title-icon" /> Operational Tracker</h2>
            <p className="proc-section__subtitle">Operational payments and disbursements across all implementing entities</p>
          </div>
        </div>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
          No operational payments available yet.
        </div>
      </section>
    );
  }

  return (
    <section className="proc-section">
      <div className="proc-section__header">
        <div>
          <h2 className="proc-section__title"><Wallet size={20} className="proc-section__title-icon" /> Operational Tracker</h2>
          <p className="proc-section__subtitle">Operational payments and disbursements across all implementing entities</p>
        </div>
      </div>

      {/* ── TOP METRIC CARDS ── */}
      <div className="proc-metrics">
        <div className="proc-metric-card proc-metric-card--hero">
          <div className="proc-metric-card__left">
            <span className="proc-metric-card__label">Total Operational Value</span>
            <span className="proc-metric-card__value proc-metric-card__value--white">${(totalAmount / 1000).toFixed(0)}K</span>
            <span className="proc-metric-card__sub">{operationalData.length} payments across {entities.length} entities</span>
          </div>
          <div className="proc-metric-card__right">
            <ProgressRing pct={disbursementRate} color="#14B8A6" size={64} stroke={6} />
            <span className="proc-metric-card__ring-label">Disbursed</span>
          </div>
        </div>
        <div className="proc-metric-card">
          <div className="proc-metric-card__icon-wrap" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <CheckCircle size={20} />
          </div>
          <span className="proc-metric-card__label">Completion Rate</span>
          <span className="proc-metric-card__value" style={{ color: '#10B981' }}>{completionRate}%</span>
          <span className="proc-metric-card__sub">{counts.complete} of {operationalData.length} items</span>
        </div>
        <div className="proc-metric-card">
          <div className="proc-metric-card__icon-wrap" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <span className="proc-metric-card__label">In Progress</span>
          <span className="proc-metric-card__value" style={{ color: '#F59E0B' }}>{counts.ongoing}</span>
          <span className="proc-metric-card__sub">${(operationalData.filter((p) => p.status === 'ongoing').reduce((s, p) => s + (p.amountReq || 0), 0) / 1000).toFixed(0)}K committed</span>
        </div>
        <div className="proc-metric-card">
          <div className="proc-metric-card__icon-wrap" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            <AlertTriangle size={20} />
          </div>
          <span className="proc-metric-card__label">At Risk</span>
          <span className="proc-metric-card__value" style={{ color: '#EF4444' }}>{counts.overdue + counts.pending}</span>
          <span className="proc-metric-card__sub">{counts.overdue} overdue, {counts.pending} pending</span>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="proc-charts-row">
        <div className="proc-chart-card">
          <div className="proc-chart-card__header">
            <h3><BarChart3 size={16} /> Status Distribution</h3>
          </div>
          <div className="proc-chart-card__body proc-chart-card__body--centered">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} items`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="proc-pie-legend">
              {statusPie.map((s) => (
                <div key={s.name} className="proc-pie-legend__item">
                  <span className="proc-pie-legend__dot" style={{ background: s.color }} />
                  <span>{s.name}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPENDITURE CATEGORY BREAKDOWN ── */}
      <div className="proc-objectives-row">
        <div className="proc-chart-card__header" style={{ marginBottom: 12 }}>
          <h3><Package size={16} /> By Expenditure Category</h3>
        </div>
        <div className="proc-obj-grid">
          {categoryBreakdown.map((o) => (
            <div key={o.category} className="proc-obj-card">
              <span className="proc-obj-card__id" title={o.category}>{o.category.length > 28 ? o.category.slice(0, 28) + '…' : o.category}</span>
              <span className="proc-obj-card__amount">${(o.amount / 1000).toFixed(0)}K</span>
              <span className="proc-obj-card__count">{o.count} payments</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="proc-filters-bar">
        <div className="proc-filters">
          <Filter size={14} />
          <button className={`proc-filter-btn ${filterEntity === 'all' ? 'proc-filter-btn--active' : ''}`} onClick={() => setFilterEntity('all')}>All Entities</button>
          {entities.map((e) => (
            <button key={e} className={`proc-filter-btn ${filterEntity === e ? 'proc-filter-btn--active' : ''}`} onClick={() => setFilterEntity(filterEntity === e ? 'all' : e)}
              style={filterEntity === e ? { borderColor: ENTITY_COLORS[e], color: ENTITY_COLORS[e], background: `${ENTITY_COLORS[e]}12` } : {}}>
              {e}
            </button>
          ))}
        </div>
        <div className="proc-filters">
          {Object.entries(statusCfg).map(([k, v]) => (
            <button key={k} className={`proc-filter-btn ${filterStatus === k ? 'proc-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === k ? 'all' : k)}
              style={filterStatus === k ? { borderColor: v.color, color: v.color, background: v.bg } : {}}>
              {v.label} ({counts[k]})
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="proc-table-wrapper">
        <div className="proc-table-header">
          <span className="proc-table-header__count">{filtered.length} of {operationalData.length} items</span>
          <span className="proc-table-header__total">Filtered value: <strong>${(filtered.reduce((s, p) => s + (p.amountReq || 0), 0) / 1000).toFixed(0)}K</strong></span>
        </div>
        <table className="proc-table">
          <thead>
            <tr><th>#</th><th>Entity</th><th>Description</th><th>Requested By</th><th>Category</th><th>Submitted</th><th>Est. Completion</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const cfg = statusCfg[p.status] || statusCfg.pending;
              const Icon = cfg.icon;
              return (
                <tr key={p.id}>
                  <td className="proc-table__id">{p.id}</td>
                  <td><span className="proc-table__entity" style={{ color: ENTITY_COLORS[p.entity] || '#0F766E' }}>{p.entity}</span></td>
                  <td className="proc-table__desc">{p.item}</td>
                  <td className="proc-table__small">{p.requestedBy || '—'}</td>
                  <td className="proc-table__small" title={p.category || ''}>{p.category ? (p.category.length > 28 ? p.category.slice(0, 28) + '…' : p.category) : '—'}</td>
                  <td className="proc-table__small">{p.submittedDate || '—'}</td>
                  <td className="proc-table__small">{p.estCompletion || '—'}</td>
                  <td className="proc-table__amount">${((p.amountReq || 0) / 1000).toFixed(0)}K</td>
                  <td><span className="proc-table__status" style={{ color: cfg.color, background: cfg.bg }}><Icon size={12} /> {cfg.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
