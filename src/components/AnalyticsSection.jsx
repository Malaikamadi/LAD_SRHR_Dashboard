import { useState, useEffect } from 'react';
import { BarChart, Bar, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { BarChart3, ChevronDown } from 'lucide-react';
import { implementingEntities as entityDefaults, entityDeepDive } from '../data/dashboardData';
import { useData, useEntityDetail } from '../context/DataContext';
import './AnalyticsSection.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((e,i) => (
        <div key={i} className="chart-tooltip__item">
          <span className="chart-tooltip__dot" style={{background:e.color}} />
          <span className="chart-tooltip__name">{e.name}:</span>
          <span className="chart-tooltip__value">{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsSection({ initialEntity }) {
  const { entities } = useData();
  const [selectedEntity, setSelectedEntity] = useState(initialEntity || 'all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync when the parent passes a new initialEntity (e.g. user clicks an entity chip)
  useEffect(() => {
    if (initialEntity) {
      setSelectedEntity(initialEntity);
    }
  }, [initialEntity]);

  // Live list (fallback to static)
  const implementingEntities = (entities && entities.length) ? entities : entityDefaults;

  const entity = implementingEntities.find(e => e.id === selectedEntity);
  const detail = useEntityDetail(selectedEntity);
  const deepDive = selectedEntity !== 'all' ? (detail.data || entityDeepDive[selectedEntity]) : null;

  // Build simple chart data for selected entity from deep dive
  const entityChartData = deepDive ? (deepDive.activities || []).map((a, i) => ({
    name: `Act ${i+1}`, status: a.status === 'complete' ? 100 : a.status === 'on-track' ? 70 : a.status === 'ongoing' ? 50 : 30
  })) : null;

  // Overall performance comparison
  const overallComparison = implementingEntities.map(e => ({
    name: e.abbrev, progress: e.progress, completed: e.tasksCompleted, total: e.tasksTotal, color: e.color
  }));

  return (
    <section className="analytics-section" id="analytics-section">
      <div className="analytics-section__header">
        <div>
          <h2 className="analytics-section__title"><BarChart3 size={20} className="analytics-section__title-icon" /> Implementing Entities Analytics</h2>
          <p className="analytics-section__subtitle">Performance analysis by implementing entity</p>
        </div>
        {/* Entity Dropdown */}
        <div className="entity-dropdown">
          <button className="entity-dropdown__trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>{selectedEntity === 'all' ? 'All Entities' : entity?.abbrev}</span>
            <ChevronDown size={16} className={dropdownOpen ? 'entity-dropdown__icon--open' : ''} />
          </button>
          {dropdownOpen && (
            <div className="entity-dropdown__menu">
              <button className={`entity-dropdown__item ${selectedEntity==='all'?'entity-dropdown__item--active':''}`} onClick={() => {setSelectedEntity('all');setDropdownOpen(false);}}>All Entities — Overall</button>
              {implementingEntities.map(e => (
                <button key={e.id} className={`entity-dropdown__item ${selectedEntity===e.id?'entity-dropdown__item--active':''}`} onClick={() => {setSelectedEntity(e.id);setDropdownOpen(false);}}>
                  <span className="entity-dropdown__dot" style={{background:e.color}} />{e.abbrev} — {e.progress}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="analytics-grid">
        {selectedEntity === 'all' ? (
          <>
            {/* Overall Entity Progress Comparison */}
            <div className="chart-card chart-card--full">
              <div className="chart-card__header"><h3>Entity Performance Comparison</h3><p className="chart-card__subtitle">Overall progress by implementing entity</p></div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={overallComparison} layout="vertical" barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis type="number" domain={[0,100]} tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{fill:'#334155',fontSize:12,fontWeight:600}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="progress" name="Progress %" radius={[0,6,6,0]} barSize={18}>
                      {overallComparison.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Budget Utilization */}
            <div className="chart-card chart-card--full">
              <div className="chart-card__header"><h3>Budget Utilization</h3><p className="chart-card__subtitle">Allocated vs spent per entity</p></div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={implementingEntities.map(e=>({name:e.abbrev,allocated:(e.budget/1000),spent:(e.spent/1000)}))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{fill:'#64748B',fontSize:10}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                    <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize:'11px'}} />
                    <Bar dataKey="allocated" name="Budget ($K)" fill="#CBD5E1" radius={[4,4,0,0]} barSize={14} />
                    <Bar dataKey="spent" name="Spent ($K)" fill="#14B8A6" radius={[4,4,0,0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Selected Entity Header */}
            <div className="entity-hero" style={{'--entity-color':entity.color}}>
              <div className="entity-hero__info">
                <h3>{entity.name}</h3>
                <div className="entity-hero__stats">
                  <div className="entity-hero__stat"><span className="entity-hero__stat-value" style={{color:entity.color}}>{entity.progress}%</span><span>Progress</span></div>
                  <div className="entity-hero__stat"><span className="entity-hero__stat-value">{entity.tasksCompleted}/{entity.tasksTotal}</span><span>Tasks</span></div>
                  <div className="entity-hero__stat"><span className="entity-hero__stat-value">${(entity.budget/1000).toFixed(0)}K</span><span>Budget</span></div>
                  <div className="entity-hero__stat"><span className="entity-hero__stat-value">${(entity.spent/1000).toFixed(0)}K</span><span>Spent</span></div>
                </div>
                <div className="entity-hero__bar"><div style={{width:`${entity.progress}%`,background:entity.color}} /></div>
              </div>
            </div>
            {/* KPI Progress */}
            {deepDive && (
              <div className="chart-card chart-card--full">
                <div className="chart-card__header"><h3>{entity.abbrev} — KPI Progress</h3><p className="chart-card__subtitle">{deepDive.kpis.length} indicators tracked</p></div>
                <div className="chart-card__body">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deepDive.kpis.map(k=>({name:k.name.length>25?k.name.slice(0,25)+'…':k.name,progress:Math.min(100,Math.round((k.actual/k.target)*100)),color:k.status==='achieved'?'#10B981':k.status==='on-track'?'#06B6D4':'#EF4444'}))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                      <XAxis type="number" domain={[0,100]} tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} unit="%" />
                      <YAxis type="category" dataKey="name" tick={{fill:'#334155',fontSize:10}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} width={180} />
                      <Tooltip formatter={v=>`${v}%`} contentStyle={{background:'white',border:'1px solid #E2E8F0',borderRadius:10,fontSize:12}} />
                      <Bar dataKey="progress" name="KPI Progress" radius={[0,6,6,0]} barSize={16}>
                        {deepDive.kpis.map((k,i)=><Cell key={i} fill={k.status==='achieved'?'#10B981':k.status==='on-track'?'#06B6D4':'#EF4444'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
