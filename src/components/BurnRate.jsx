import { Flame } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import { burnRateData, fundFlowData } from '../data/dashboardData';
import './BurnRate.css';

function WaterfallTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <div className="chart-tooltip__item">
        <span className="chart-tooltip__dot" style={{ background: data.isTotal ? '#4A7F8C' : '#2A3C42' }} />
        <span className="chart-tooltip__name">Amount Disbursed:</span>
        <span className="chart-tooltip__value">${(data.amount / 1000000).toFixed(2)}M</span>
      </div>
    </div>
  );
}

export default function BurnRate() {
  const { totalFunds, totalDispensed, totalUnspent, burnRates } = burnRateData;

  // Process data for Waterfall chart
  let cumulative = 0;
  const waterfallData = fundFlowData.map(item => {
    const start = cumulative;
    cumulative += item.amount;
    return {
      ...item,
      range: [start, cumulative],
      labelAmount: item.amount >= 1000000 ? `${item.amount / 1000000}M` : `${item.amount / 1000}K`
    };
  });
  
  // Add total column
  waterfallData.push({
    date: 'Total amount received',
    amount: cumulative,
    range: [0, cumulative],
    labelAmount: `${cumulative / 1000000}M`,
    isTotal: true
  });

  return (
    <section className="burn-section" id="burn-rate-section">
      {/* Summary Cards Row */}
      <div className="burn-stats-row">
        <div className="burn-stat-left">
          <div className="burn-stat-card">
            <span className="burn-stat-card__title">Total funds ($) provided by<br/>Donors as at May, 2025</span>
            <span className="burn-stat-card__val">${(totalFunds / 1000000).toFixed(2)}M</span>
          </div>
          <div className="burn-stat-card">
            <span className="burn-stat-card__title">Total Amount Dispensed<br/>($):</span>
            <span className="burn-stat-card__val">{(totalDispensed / 1000000).toFixed(1)}M</span>
          </div>
          <div className="burn-stat-card">
            <span className="burn-stat-card__title">Total Amount Unspent<br/>($):</span>
            <span className="burn-stat-card__val">{totalUnspent >= 1000000 ? `${(totalUnspent / 1000000).toFixed(1)}M` : `${(totalUnspent / 1000).toFixed(1)}K`}</span>
          </div>
        </div>
        
        <div className="burn-stat-right">
          <h3 className="burn-rate-title">Burn Rate (%)</h3>
          <div className="burn-rate-grid">
             <div className="burn-rate-item">
               <span className="burn-rate-item__lbl">In 2023</span>
               <span className="burn-rate-item__val">{burnRates.y2023}%</span>
             </div>
             <div className="burn-rate-item">
               <span className="burn-rate-item__lbl">In 2024</span>
               <span className="burn-rate-item__val">{burnRates.y2024}%</span>
             </div>
             <div className="burn-rate-item">
               <span className="burn-rate-item__lbl">In 2025</span>
               <span className="burn-rate-item__val">{burnRates.y2025}%</span>
             </div>
             <div className="burn-rate-item">
               <span className="burn-rate-item__lbl">At total Disbursement</span>
               <span className="burn-rate-item__val burn-rate-item__val--blue">{burnRates.total}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="fund-waterfall">
        <h3 className="fund-waterfall__title">FLOW OF FUNDS FROM DONOR</h3>
        <div className="fund-waterfall__chart">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fontSize: 11, fill: '#334155' }} dy={10} />
              <YAxis 
                tickFormatter={v => `${v / 1000000}M`} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 11, fill: '#334155' }} 
                domain={[0, 60000000]} 
                ticks={[0, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000, 35000000, 40000000, 45000000, 50000000, 55000000, 60000000]} 
                label={{ value: 'Amount ($) Disbursed', angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: '11px', fill: '#334155' } }}
              />
              <Tooltip content={<WaterfallTooltip />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="range" radius={[0, 0, 0, 0]} barSize={45}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isTotal ? '#4A7F8C' : '#2A3C42'} />
                ))}
                <LabelList dataKey="labelAmount" position="insideTop" fill="#fff" style={{ fontSize: '11px', fontWeight: 600, pointerEvents: 'none' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
