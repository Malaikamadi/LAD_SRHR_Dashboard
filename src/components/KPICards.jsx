import { useEffect, useState, useRef } from 'react';
import {
  Heart, Baby, Shield, Building2, Stethoscope, UserCheck,
  AlertTriangle, MapPin, TrendingUp, TrendingDown, Target, Activity
} from 'lucide-react';
import { kpiData } from '../data/dashboardData';
import './KPICards.css';

const iconMap = {
  Heart, Baby, Shield, Building2, Stethoscope, UserCheck, AlertTriangle, MapPin
};

function AnimatedNumber({ value, decimals = 0, duration = 2000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = performance.now();
    const animate = (time) => {
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number((eased * value).toFixed(decimals)));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, decimals, duration]);

  return <span>{display.toLocaleString()}</span>;
}

function MiniSparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="kpi-sparkline">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

function ProgressRing({ value, target, color, size = 40 }) {
  if (!target) return null;
  const pct = Math.min((value / target) * 100, 100);
  const radius = (size - 6) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="kpi-progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.5s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-gray-300)"
        fontSize="9"
        fontWeight="600"
        fontFamily="var(--font-sans)"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

import { useData } from '../context/DataContext';

export default function KPICards() {
  const { overview } = useData();

  const mappedKpiData = kpiData.map(kpi => {
    let newValue = kpi.value;
    if (kpi.id === 'mmr' && overview?.maternalMortalityRate) newValue = overview.maternalMortalityRate;
    if (kpi.id === 'cpr' && overview?.contraceptivePrevalence) newValue = parseFloat(overview.contraceptivePrevalence);
    if (kpi.id === 'anc' && overview?.ancAttendance) newValue = parseFloat(overview.ancAttendance);
    if (kpi.id === 'tpr' && overview?.totalTeenagePregnancies) newValue = overview.totalTeenagePregnancies;
    return { ...kpi, value: newValue };
  });

  return (
    <section className="kpi-section" id="kpi-section">
      <div className="kpi-section__header">
        <div>
          <h2 className="kpi-section__title">
            <Activity size={22} className="kpi-section__title-icon" />
            Key Performance Indicators
          </h2>
          <p className="kpi-section__subtitle">Real-time national SRHR metrics — Q4 2025</p>
        </div>
        <div className="kpi-section__actions">
          <span className="kpi-live-indicator">
            <span className="kpi-live-dot" />
            LIVE
          </span>
        </div>
      </div>

      <div className="kpi-grid">
        {mappedKpiData.map((kpi, index) => {
          const Icon = iconMap[kpi.icon];
          const isNegativeGood = ['mmr', 'tpr', 'gbv'].includes(kpi.id);
          const trendPositive = isNegativeGood ? kpi.change < 0 : kpi.change > 0;
          
          return (
            <div 
              key={kpi.id} 
              className="kpi-card"
              style={{ animationDelay: `${index * 80}ms` }}
              id={`kpi-${kpi.id}`}
            >
              <div className="kpi-card__top">
                <div className="kpi-card__icon" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                  {Icon && <Icon size={20} />}
                </div>
                <ProgressRing value={kpi.value} target={kpi.target} color={kpi.color} />
              </div>

              <div className="kpi-card__body">
                <p className="kpi-card__label">{kpi.title}</p>
                <div className="kpi-card__value-row">
                  <span className="kpi-card__value" style={{ color: kpi.color }}>
                    <AnimatedNumber 
                      value={kpi.value} 
                      decimals={kpi.value % 1 !== 0 ? 1 : 0} 
                    />
                  </span>
                  <span className="kpi-card__unit">{kpi.unit}</span>
                </div>
              </div>

              <div className="kpi-card__footer">
                <div className={`kpi-card__trend ${trendPositive ? 'kpi-card__trend--positive' : 'kpi-card__trend--negative'}`}>
                  {trendPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  {kpi.id === 'gbv' && kpi.change > 0 ? (
                    <>
                      {trendPositive ? <TrendingUp size={14} /> : null}
                    </>
                  ) : null}
                  <span>{Math.abs(kpi.change)}{typeof kpi.value === 'number' && kpi.value < 100 ? '%' : ''}</span>
                </div>
                <MiniSparkline data={kpi.sparkline} color={kpi.color} />
              </div>
              
              {kpi.target && (
                <div className="kpi-card__target">
                  <Target size={11} />
                  <span>Target: {kpi.target}{kpi.unit === '%' ? '%' : ` ${kpi.unit}`}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
