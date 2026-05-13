import { Handshake, ArrowDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { fundFlowData, implementingEntities, burnRateData } from '../data/dashboardData';
import './DonorImpact.css';

export default function DonorImpact() {
  const entityAllocation = implementingEntities.map(e => ({
    name: e.abbrev, allocated: Math.round(e.budget / 1000), disbursed: Math.round(e.spent / 1000), color: e.color
  }));

  return (
    <section className="donor-section" id="donor-impact-section">
      <div className="donor-section__header">
        <div>
          <h2 className="donor-section__title"><Handshake size={20} className="donor-section__title-icon" /> Donor Impact</h2>
          <p className="donor-section__subtitle">Flow of funds from donor through to program implementation</p>
        </div>
      </div>

      {/* Fund Flow Waterfall */}
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

      <div className="donor-grid">
        {/* Entity Allocation Chart */}
        <div className="chart-card chart-card--full">
          <div className="chart-card__header"><h3>Fund Allocation by Entity ($K)</h3><p className="chart-card__subtitle">Allocated budget vs disbursed amounts per implementing entity</p></div>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={entityAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{fill:'#64748B',fontSize:10}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                <YAxis tick={{fill:'#64748B',fontSize:11}} axisLine={{stroke:'#E2E8F0'}} tickLine={false} />
                <Tooltip formatter={v=>`$${v}K`} contentStyle={{background:'white',border:'1px solid #E2E8F0',borderRadius:10,fontSize:12}} />
                <Bar dataKey="allocated" name="Allocated" fill="#CBD5E1" radius={[4,4,0,0]} barSize={18} />
                <Bar dataKey="disbursed" name="Disbursed" radius={[4,4,0,0]} barSize={18}>
                  {entityAllocation.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
