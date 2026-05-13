import { useState, useMemo } from 'react';
import { ShoppingCart, Filter, CheckCircle, Clock, AlertTriangle, CircleDot, TrendingUp, DollarSign, Package, Building2, Calendar, ArrowUpRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { procurementData, implementingEntities } from '../data/dashboardData';
import './ProcurementTracker.css';

const statusCfg = {
  complete: { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Complete' },
  ongoing: { icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Ongoing' },
  pending: { icon: CircleDot, color: '#64748B', bg: 'rgba(100,116,139,0.1)', label: 'Pending' },
  overdue: { icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Overdue' },
};

const ENTITY_COLORS = {
  'SLeSHI': '#14B8A6', 'RCH': '#8B5CF6', 'PHC': '#06B6D4', 'NEMS': '#EF4444',
  'NMSA': '#10B981', 'COMAHS': '#F97316', 'Gender': '#EC4899', 'DPPI': '#F59E0B',
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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip__item">
          <span className="chart-tooltip__dot" style={{ background: p.color }} />
          <span className="chart-tooltip__name">{p.name}:</span>
          <span className="chart-tooltip__value">${(p.value / 1000).toFixed(0)}K</span>
        </div>
      ))}
    </div>
  );
}

export default function ProcurementTracker() {
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const entities = [...new Set(procurementData.map(p => p.entity))];
  const filtered = procurementData.filter(p => {
    if (filterEntity !== 'all' && p.entity !== filterEntity) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const totalAmount = procurementData.reduce((s, p) => s + p.amountReq, 0);
  const completedAmount = procurementData.filter(p => p.status === 'complete').reduce((s, p) => s + p.amountReq, 0);
  const counts = {
    complete: procurementData.filter(p => p.status === 'complete').length,
    ongoing: procurementData.filter(p => p.status === 'ongoing').length,
    pending: procurementData.filter(p => p.status === 'pending').length,
    overdue: procurementData.filter(p => p.status === 'overdue').length,
  };
  const completionRate = Math.round((counts.complete / procurementData.length) * 100);
  const disbursementRate = Math.round((completedAmount / totalAmount) * 100);

  // Entity spending breakdown
  const entitySpending = useMemo(() => {
    const map = {};
    procurementData.forEach(p => {
      if (!map[p.entity]) map[p.entity] = { entity: p.entity, total: 0, complete: 0, ongoing: 0, count: 0 };
      map[p.entity].total += p.amountReq;
      map[p.entity].count += 1;
      if (p.status === 'complete') map[p.entity].complete += p.amountReq;
      if (p.status === 'ongoing') map[p.entity].ongoing += p.amountReq;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, []);

  // Status distribution for pie
  const statusPie = useMemo(() => [
    { name: 'Complete', value: counts.complete, color: '#10B981' },
    { name: 'Ongoing', value: counts.ongoing, color: '#F59E0B' },
    { name: 'Pending', value: counts.pending, color: '#94A3B8' },
    { name: 'Overdue', value: counts.overdue, color: '#EF4444' },
  ], [counts]);

  // Objective breakdown
  const objectiveBreakdown = useMemo(() => {
    const map = {};
    procurementData.forEach(p => {
      if (!map[p.objective]) map[p.objective] = { obj: p.objective, count: 0, amount: 0 };
      map[p.objective].count += 1;
      map[p.objective].amount += p.amountReq;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, []);

  return (
    <section className="proc-section">
      <div className="proc-section__header">
        <div>
          <h2 className="proc-section__title"><ShoppingCart size={20} className="proc-section__title-icon" /> Procurement Tracker</h2>
          <p className="proc-section__subtitle">Track procurement requests, approvals and delivery across all implementing entities</p>
        </div>
      </div>

      {/* ── TOP METRIC CARDS ── */}
      <div className="proc-metrics">
        <div className="proc-metric-card proc-metric-card--hero">
          <div className="proc-metric-card__left">
            <span className="proc-metric-card__label">Total Procurement Value</span>
            <span className="proc-metric-card__value proc-metric-card__value--white">${(totalAmount / 1000).toFixed(0)}K</span>
            <span className="proc-metric-card__sub">{procurementData.length} items across {entities.length} entities</span>
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
          <span className="proc-metric-card__sub">{counts.complete} of {procurementData.length} items</span>
        </div>
        <div className="proc-metric-card">
          <div className="proc-metric-card__icon-wrap" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <span className="proc-metric-card__label">In Progress</span>
          <span className="proc-metric-card__value" style={{ color: '#F59E0B' }}>{counts.ongoing}</span>
          <span className="proc-metric-card__sub">${(procurementData.filter(p=>p.status==='ongoing').reduce((s,p)=>s+p.amountReq,0)/1000).toFixed(0)}K committed</span>
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


        {/* Status Distribution Pie */}
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
              {statusPie.map(s => (
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

      {/* ── OBJECTIVE BREAKDOWN ── */}
      <div className="proc-objectives-row">
        <div className="proc-chart-card__header" style={{ marginBottom: 12 }}>
          <h3><Package size={16} /> By Strategic Objective</h3>
        </div>
        <div className="proc-obj-grid">
          {objectiveBreakdown.map(o => (
            <div key={o.obj} className="proc-obj-card">
              <span className="proc-obj-card__id">{o.obj}</span>
              <span className="proc-obj-card__amount">${(o.amount / 1000).toFixed(0)}K</span>
              <span className="proc-obj-card__count">{o.count} procurement items</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ENTITY + STATUS FILTERS ── */}
      <div className="proc-filters-bar">
        <div className="proc-filters">
          <Filter size={14} />
          <button className={`proc-filter-btn ${filterEntity === 'all' ? 'proc-filter-btn--active' : ''}`} onClick={() => setFilterEntity('all')}>All Entities</button>
          {entities.map(e => (
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
          <span className="proc-table-header__count">{filtered.length} of {procurementData.length} items</span>
          <span className="proc-table-header__total">Filtered value: <strong>${(filtered.reduce((s, p) => s + p.amountReq, 0) / 1000).toFixed(0)}K</strong></span>
        </div>
        <table className="proc-table">
          <thead>
            <tr><th>#</th><th>Entity</th><th>Item Description</th><th>Requested By</th><th>Submitted</th><th>Est. Completion</th><th>Amount</th><th>Objective</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const cfg = statusCfg[p.status];
              const Icon = cfg.icon;
              return (
                <tr key={p.id}>
                  <td className="proc-table__id">{p.id}</td>
                  <td><span className="proc-table__entity" style={{ color: ENTITY_COLORS[p.entity] || '#0F766E' }}>{p.entity}</span></td>
                  <td className="proc-table__desc">{p.item}</td>
                  <td className="proc-table__small">{p.requestedBy}</td>
                  <td className="proc-table__small">{p.submittedDate}</td>
                  <td className="proc-table__small">{p.estCompletion || '—'}</td>
                  <td className="proc-table__amount">${(p.amountReq / 1000).toFixed(0)}K</td>
                  <td><span className="proc-table__obj">{p.objective}</span></td>
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
