import { useState } from 'react';
import { Flag, ChevronDown, Target, BarChart3, CheckCircle, Clock, AlertTriangle, Award, TrendingUp, List } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { implementingEntities as entityDefaults, entityDeepDive as deepDiveDefaults } from '../data/dashboardData';
import { useData, useEntityDetail } from '../context/DataContext';
import './MilestoneEntityView.css';

const statusCfg = {
  'achieved': { color:'#10B981', bg:'rgba(16,185,129,0.1)', label:'Achieved' },
  'on-track': { color:'#06B6D4', bg:'rgba(6,182,212,0.1)', label:'On Track' },
  'ongoing': { color:'#F59E0B', bg:'rgba(245,158,11,0.1)', label:'Ongoing' },
  'behind': { color:'#EF4444', bg:'rgba(239,68,68,0.1)', label:'Behind' },
  'complete': { color:'#10B981', bg:'rgba(16,185,129,0.1)', label:'Complete' },
  'overdue': { color:'#EF4444', bg:'rgba(239,68,68,0.1)', label:'Overdue' },
};

function StatusBadge({ status }) {
  const cfg = statusCfg[status] || statusCfg['ongoing'];
  return <span className="ms-status-badge" style={{color:cfg.color,background:cfg.bg}}>{cfg.label}</span>;
}

function KPIProgressBar({ actual, target, color }) {
  const pct = Math.min(100, Math.round((actual / target) * 100));
  return (
    <div className="ms-kpi-bar">
      <div className="ms-kpi-bar__track"><div className="ms-kpi-bar__fill" style={{width:`${pct}%`,background:color||'var(--color-teal)'}} /></div>
      <span className="ms-kpi-bar__pct">{pct}%</span>
    </div>
  );
}

export default function MilestoneEntityView() {
  const { entities } = useData();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Live list with static fallback
  const implementingEntities = (entities && entities.length) ? entities : entityDefaults;

  // Detail for selected entity (deferred fetch)
  const detail = useEntityDetail(selectedEntity);
  const liveDeep = detail.data;
  const fallbackDeep = selectedEntity ? deepDiveDefaults[selectedEntity] : null;
  const deepDive = liveDeep || fallbackDeep;

  // Aggregate KPIs across all entities for the overview summary cards.
  // (When live data is loaded we don't have all entity KPIs in a single payload;
  //  we use cumulative task counts instead which the API already provides.)
  const totalTasks = implementingEntities.reduce((s, e) => s + (e.tasksTotal || 0), 0);
  const achievedTasks = implementingEntities.reduce((s, e) => s + (e.tasksCompleted || 0), 0);
  const onTrackTasks = implementingEntities.reduce((s, e) => s + (e.ongoing || 0), 0);
  const behindTasks = implementingEntities.reduce((s, e) => s + ((e.overdue || 0) + (e.pending || 0)), 0);

  const entityApiProgress = implementingEntities.map(e => ({
    name: e.abbrev, progress: e.progress || 0, color: e.color,
  }));

  const entity = selectedEntity ? implementingEntities.find(e => e.id === selectedEntity) : null;

  return (
    <section className="ms-section" id="milestone-section">
      <div className="ms-section__header">
        <div>
          <h2 className="ms-section__title"><Flag size={20} className="ms-section__title-icon" /> Milestone Tracking</h2>
          <p className="ms-section__subtitle">Deep-dive into each implementing entity — objectives, KPIs, and activities</p>
        </div>
        {/* Entity Dropdown */}
        <div className="ms-dropdown">
          <button className="ms-dropdown__trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>{selectedEntity ? entity?.abbrev : 'Select Entity'}</span>
            <ChevronDown size={16} className={dropdownOpen ? 'ms-dropdown__icon--open' : ''} />
          </button>
          {dropdownOpen && (
            <div className="ms-dropdown__menu">
              <button className={`ms-dropdown__item ${!selectedEntity?'ms-dropdown__item--active':''}`} onClick={() => {setSelectedEntity(null);setDropdownOpen(false);}}>
                Overview — All Entities
              </button>
              {implementingEntities.map(e => (
                <button key={e.id} className={`ms-dropdown__item ${selectedEntity===e.id?'ms-dropdown__item--active':''}`} onClick={() => {setSelectedEntity(e.id);setDropdownOpen(false);}}>
                  <span className="ms-dropdown__dot" style={{background:e.color}} />{e.abbrev} — {e.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!selectedEntity ? (
        /* ===== OVERVIEW MODE ===== */
        <>
          {/* Task Summary Cards (aggregated across all entities) */}
          <div className="ms-kpi-summary">
            <div className="ms-kpi-summary-card">
              <List size={20} color="var(--color-teal)" />
              <div><span className="ms-kpi-summary-card__value">{totalTasks}</span><span>Total Milestones</span></div>
            </div>
            <div className="ms-kpi-summary-card">
              <CheckCircle size={20} color="#10B981" />
              <div><span className="ms-kpi-summary-card__value" style={{color:'#10B981'}}>{achievedTasks}</span><span>Completed</span></div>
            </div>
            <div className="ms-kpi-summary-card">
              <TrendingUp size={20} color="#06B6D4" />
              <div><span className="ms-kpi-summary-card__value" style={{color:'#06B6D4'}}>{onTrackTasks}</span><span>Ongoing</span></div>
            </div>
            <div className="ms-kpi-summary-card">
              <AlertTriangle size={20} color="#EF4444" />
              <div><span className="ms-kpi-summary-card__value" style={{color:'#EF4444'}}>{behindTasks}</span><span>Overdue / Pending</span></div>
            </div>
          </div>

          {/* Overall KPI Progress Chart */}
          <div className="chart-card" style={{marginBottom:'var(--space-5)'}}>
            <div className="chart-card__header"><h3>KPI Completion by Entity</h3><p className="chart-card__subtitle">Overall activity progress indicator across all implementing entities</p></div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={entityApiProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{fill:'#334155',fontSize:12,fontWeight:600}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} width={100} />
                  <Tooltip formatter={v=>`${v}%`} contentStyle={{background:'white',border:'1px solid #E2E8F0',borderRadius:10,fontSize:12}} />
                  <Bar dataKey="progress" name="KPI Progress" radius={[0,6,6,0]} barSize={18}>
                    {entityApiProgress.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Entity Cards Grid */}
          <div className="ms-entity-grid">
            {implementingEntities
              .filter(e => (e.tasksTotal || 0) > 0)
              .map(e => (
                <button key={e.id} className="ms-entity-card" onClick={() => setSelectedEntity(e.id)} style={{'--ec':e.color}}>
                  <div className="ms-entity-card__header">
                    <span className="ms-entity-card__dot" style={{background:e.color}} />
                    <span className="ms-entity-card__name">{e.abbrev}</span>
                  </div>
                  <div className="ms-entity-card__bar"><div style={{width:`${e.progress}%`,background:e.color}} /></div>
                  <div className="ms-entity-card__stats">
                    <span>{e.objectiveCount ?? 0} Objectives</span>
                    <span>{e.tasksCompleted}/{e.tasksTotal} Milestones</span>
                    <span style={{color:e.color,fontWeight:700}}>{e.progress}%</span>
                  </div>
                </button>
              ))}
          </div>
        </>
      ) : (
        /* ===== ENTITY DEEP-DIVE ===== */
        <>
          {/* Entity Hero */}
          <div className="ms-entity-hero" style={{'--ec':entity.color}}>
            <div className="ms-entity-hero__left">
              <h3>{entity.name}</h3>
              <div className="ms-entity-hero__bar"><div style={{width:`${entity.progress}%`,background:entity.color}} /></div>
              <div className="ms-entity-hero__meta">
                <span>Progress: <strong style={{color:entity.color}}>{entity.progress}%</strong></span>
                <span>Tasks: <strong>{entity.tasksCompleted}/{entity.tasksTotal}</strong></span>
                <span>Budget: <strong>${(entity.budget/1000).toFixed(0)}K</strong></span>
                <span>Spent: <strong>${(entity.spent/1000).toFixed(0)}K</strong></span>
              </div>
            </div>
          </div>

          {detail.loading && (
            <div className="ms-card"><div className="ms-card__header"><h3>Loading entity detail…</h3></div></div>
          )}

          {/* Objectives */}
          {deepDive?.objectives?.length > 0 && (
            <div className="ms-card">
              <div className="ms-card__header"><Target size={18} color="var(--color-teal)" /><h3>Objectives</h3></div>
              <div className="ms-objectives">
                {deepDive.objectives.map(obj => (
                  <div key={obj.id} className="ms-objective-item">
                    <div className="ms-objective-item__top">
                      <span className="ms-objective-item__id">{obj.id}</span>
                      <span className="ms-objective-item__name">{obj.name}</span>
                      {obj.status && <StatusBadge status={obj.status} />}
                    </div>
                    {obj.year && <span className="ms-objective-item__year">Implementation: {obj.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs Table */}
          {deepDive?.kpis?.length > 0 && (
            <div className="ms-card">
              <div className="ms-card__header"><BarChart3 size={18} color="var(--color-teal)" /><h3>Key Performance Indicators</h3><span className="ms-card__count">{deepDive.kpis.length} indicators</span></div>
              <div className="ms-table-wrapper">
                <table className="ms-table">
                  <thead><tr><th>#</th><th>KPI</th><th>Type</th><th>Year</th><th>Target</th><th>Actual</th><th>Progress</th><th>Status</th></tr></thead>
                  <tbody>
                    {deepDive.kpis.map((kpi, i) => (
                      <tr key={i}>
                        <td>{i+1}</td>
                        <td className="ms-table__kpi-name">{kpi.name}</td>
                        <td><span className="ms-table__type">{kpi.type || '—'}</span></td>
                        <td>{kpi.year || '—'}</td>
                        <td className="ms-table__num">{kpi.target != null ? kpi.target.toLocaleString() : '—'}</td>
                        <td className="ms-table__num">{kpi.actual != null ? kpi.actual.toLocaleString() : '—'}</td>
                        <td>{kpi.target ? <KPIProgressBar actual={kpi.actual || 0} target={kpi.target} color={entity.color} /> : '—'}</td>
                        <td><StatusBadge status={kpi.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activities & Milestones Table */}
          {deepDive?.activities?.length > 0 && (
            <div className="ms-card">
              <div className="ms-card__header"><Award size={18} color="var(--color-teal)" /><h3>Activities & Milestones</h3><span className="ms-card__count">{deepDive.activities.length} milestones</span></div>
              <div className="ms-table-wrapper">
                <table className="ms-table">
                  <thead><tr><th>#</th><th>Sub-Activity</th><th>Milestone</th><th>Lead</th><th>Planned End</th><th>Actual End</th><th>Status</th></tr></thead>
                  <tbody>
                    {deepDive.activities.map((act, i) => (
                      <tr key={i}>
                        <td>{i+1}</td>
                        <td className="ms-table__kpi-name">{act.activity}</td>
                        <td>{act.milestone || act.api || '—'}</td>
                        <td>{act.lead || '—'}</td>
                        <td>{act.plannedEnd || '—'}</td>
                        <td>{act.actualEnd || act.actual || '—'}</td>
                        <td><StatusBadge status={act.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
