import { Flame, DollarSign, ArrowDown } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { burnRateData, fundFlowData, implementingEntities } from '../data/dashboardData';
import './BurnRate.css';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="chart-tooltip"><p className="chart-tooltip__label">{label}</p>
      {payload.map((e,i) => (<div key={i} className="chart-tooltip__item"><span className="chart-tooltip__dot" style={{background:e.color}} /><span className="chart-tooltip__name">{e.name}:</span><span className="chart-tooltip__value">${e.value}K</span></div>))}
    </div>
  );
}

export default function BurnRate() {
  const { totalBudget, totalSpent, operationalTotal, operationalSpent, procurementTotal, procurementSpent, monthlyBurn } = burnRateData;
  const burnPct = ((totalSpent / totalBudget) * 100).toFixed(1);
  const opPct = ((operationalSpent / operationalTotal) * 100).toFixed(1);
  const prPct = ((procurementSpent / procurementTotal) * 100).toFixed(1);

  return (
    <section className="burn-section" id="burn-rate-section">
      <div className="burn-section__header">
        <div>
          <h2 className="burn-section__title"><Flame size={20} className="burn-section__title-icon" /> Burn Rate</h2>
          <p className="burn-section__subtitle">Program expenditure — Operational payments & procurement activities</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="burn-summary">
        <div className="burn-summary-card burn-summary-card--main">
          <DollarSign size={20} />
          <div><span className="burn-summary-card__value">${(totalSpent/1000000).toFixed(2)}M</span><span className="burn-summary-card__sub">of ${(totalBudget/1000000).toFixed(2)}M · {burnPct}% burned</span></div>
          <div className="burn-summary-card__bar"><div style={{width:`${burnPct}%`}} /></div>
        </div>
        <div className="burn-summary-card">
          <div className="burn-summary-card__label">Operational Payments</div>
          <span className="burn-summary-card__value" style={{color:'#14B8A6'}}>${(operationalSpent/1000000).toFixed(2)}M</span>
          <span className="burn-summary-card__sub">{opPct}% of ${(operationalTotal/1000000).toFixed(2)}M</span>
          <div className="burn-summary-card__bar burn-summary-card__bar--teal"><div style={{width:`${opPct}%`}} /></div>
        </div>
        <div className="burn-summary-card">
          <div className="burn-summary-card__label">Procurement Activities</div>
          <span className="burn-summary-card__value" style={{color:'#F59E0B'}}>${(procurementSpent/1000000).toFixed(2)}M</span>
          <span className="burn-summary-card__sub">{prPct}% of ${(procurementTotal/1000000).toFixed(2)}M</span>
          <div className="burn-summary-card__bar burn-summary-card__bar--amber"><div style={{width:`${prPct}%`}} /></div>
        </div>
      </div>

      {/* Fund Flow Pipeline */}
      <div className="fund-flow">
        <h3 className="fund-flow__title">Fund Flow Pipeline</h3>
        <div className="fund-flow__pipeline">
          {fundFlowData.map((stage, i) => (
            <div key={i} className="fund-flow__stage" style={{animationDelay:`${i*100}ms`}}>
              <div className="fund-flow__stage-bar">
                <div className="fund-flow__stage-fill" style={{height:`${stage.percentage}%`,background: i===0?'var(--color-deep-blue)': i<3?'var(--color-teal)': i<5?'#14B8A6':'#F59E0B'}} />
              </div>
              <div className="fund-flow__stage-info">
                <span className="fund-flow__stage-amount">${(stage.amount/1000000).toFixed(2)}M</span>
                <span className="fund-flow__stage-name">{stage.stage}</span>
                <span className="fund-flow__stage-pct">{stage.percentage}%</span>
              </div>
              {i < fundFlowData.length-1 && <div className="fund-flow__arrow"><ArrowDown size={14} /></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="burn-grid">
        {/* Monthly Burn */}
        <div className="chart-card chart-card--full">
          <div className="chart-card__header"><h3>Monthly Expenditure Trend ($K)</h3><p className="chart-card__subtitle">Operational payments vs procurement activities over 12 months</p></div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyBurn}>
                <defs>
                  <linearGradient id="burnOp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.3}/><stop offset="100%" stopColor="#14B8A6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="burnPr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/><stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'12px'}} />
                <Area type="monotone" dataKey="operational" name="Operational" stroke="#14B8A6" fill="url(#burnOp)" strokeWidth={2.5} dot={{r:3,fill:'#14B8A6'}} />
                <Area type="monotone" dataKey="procurement" name="Procurement" stroke="#F59E0B" fill="url(#burnPr)" strokeWidth={2.5} dot={{r:3,fill:'#F59E0B'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="chart-card">
          <div className="chart-card__header"><h3>Expenditure Split</h3></div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={[{name:'Operational',value:operationalSpent},{name:'Procurement',value:procurementSpent}]}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  <Cell fill="#14B8A6" /><Cell fill="#F59E0B" />
                </Pie>
                <Tooltip formatter={v=>`$${(v/1000000).toFixed(2)}M`} />
                <Legend wrapperStyle={{fontSize:'12px'}} formatter={v=><span style={{color:'#475569'}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entity Burn */}
        <div className="chart-card">
          <div className="chart-card__header"><h3>Entity Burn Rate</h3></div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={implementingEntities.map(e=>({name:e.abbrev,rate:Math.round((e.spent/e.budget)*100),color:e.color}))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{fill:'#64748B',fontSize:10}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill:'#334155',fontSize:10}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="rate" name="Burn Rate %" radius={[0,4,4,0]} barSize={14}>
                  {implementingEntities.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
