import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import HealthMap from './components/HealthMap';
import AnalyticsSection from './components/AnalyticsSection';
import BurnRate from './components/BurnRate';
import ProcurementTracker from './components/ProcurementTracker';
import OperationalTracker from './components/OperationalTracker';
import MilestoneTracking from './components/MilestoneTracking';
import {
  HeartPulse, Stethoscope, Package, Truck, Database, ShieldCheck,
  Users, Activity, Target, ChevronRight
} from 'lucide-react';
import './App.css';

const CENTRAL_GOAL = {
  title: 'Reduce Preventable Maternal and Child Deaths',
  target: 'Less than 300 per 100,000 by end of 2025',
  status: '302 per 100,000 (internal data)',
};

const HEALTH_PILLARS = [
  { id: 1, title: 'Service Delivery',           desc: 'Quality-assured, standardised and patient-centred care',                                                                                       icon: HeartPulse,  color: '#15803D' },
  { id: 2, title: 'Health Workforce',           desc: 'Skilled, motivated, and equitably deployed workforce delivering quality, client-centred SRH care at all levels',                              icon: Stethoscope, color: '#16A34A' },
  { id: 3, title: 'Supply Chain',               desc: 'Availability & continuous access to essential SRH commodities through efficient, transparent, and locally led systems',                       icon: Package,     color: '#0891B2' },
  { id: 4, title: 'Referral Systems',           desc: 'Coordinated, timely and reliable patient transfers to ensure access to appropriate care without delay',                                       icon: Truck,       color: '#2563EB' },
  { id: 5, title: 'Data and Digital Systems',   desc: 'Real-time, evidence-based decisions through integrated digital tools and quality data systems',                                              icon: Database,    color: '#1D4ED8' },
];

const CROSS_CUTTING_PILLAR = {
  title: 'Cross-cutting pillars: Governance and M&E',
  desc: 'Strong leadership, accountability and continuous monitoring & evaluation underpin all five pillars',
  icon: ShieldCheck,
  color: '#0F766E',
};

const ENTITIES = [
  { id: 'sleshi', name: 'Sierra Leone Social Health Insurance', abbr: 'SLESHI', color: '#0F766E' },
  { id: 'rch', name: 'Directorate of Reproductive and Child Health', abbr: 'RCH', color: '#2563EB' },
  { id: 'phc', name: 'Directorate of Primary Health Care', abbr: 'PHC', color: '#7C3AED' },
  { id: 'dppi', name: 'Directorate of Policy Planning and Information', abbr: 'DPPI', color: '#D97706' },
  { id: 'nems', name: 'Directorate of National Emergency Medical Services', abbr: 'NEMS', color: '#DC2626' },
  { id: 'donor_coord', name: 'Directorate of Donor Coordination', abbr: 'Donor Coordination', color: '#0891B2' },
  { id: 'comahs', name: 'Directorate of College of Medicine and Allied Health Sciences', abbr: 'COMAHS', color: '#059669' },
  { id: 'gender', name: 'Directorate of Gender Sciences', abbr: 'Gender', color: '#DB2777' },
  { id: 'postgraduate', name: 'Directorate of Post Graduate College of Health Specialties', abbr: 'PGCHS', color: '#4F46E5' },
  { id: 'nmsa', name: 'National Medical Supplies Agency', abbr: 'NMSA', color: '#EA580C' },
];

function renderSection(section, initialEntity) {
  switch (section) {
    case 'overview': return <KPICards />;
    case 'map': return <HealthMap />;
    case 'analytics': return <AnalyticsSection initialEntity={initialEntity} />;
    case 'burn-rate': return <BurnRate />;
    case 'procurement': return <ProcurementTracker />;
    case 'operational': return <OperationalTracker />;
    case 'milestones': return <MilestoneTracking initialEntity={initialEntity} />;
    default: return <KPICards />;
  }
}

import { DataProvider, useData } from './context/DataContext';

function DashboardContent() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [overviewEntity, setOverviewEntity] = useState(null);
  const { loading, error, refresh } = useData();
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: 'white', fontFamily: 'Inter, system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, border: '4px solid rgba(20,184,166,0.25)', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Loading National Health Data…</h2>
        <p style={{ color: '#94A3B8', margin: 0, fontSize: '.9rem' }}>Fetching the master Excel from <code style={{ color: '#14B8A6' }}>{apiBase}</code></p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: '#E2E8F0', fontFamily: 'Inter, system-ui, sans-serif', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 32 }}>⚠</div>
        <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#F87171' }}>Unable to reach the data backend</h2>
        <p style={{ color: '#94A3B8', maxWidth: 640, margin: 0, lineHeight: 1.55 }}>
          The dashboard tried to fetch live data from <code style={{ color: '#14B8A6', background: '#1E293B', padding: '2px 8px', borderRadius: 4 }}>{apiBase}</code> but the request failed:
        </p>
        <pre style={{ color: '#FBBF24', background: '#1E293B', padding: '12px 18px', borderRadius: 8, fontSize: '.85rem', maxWidth: 640, overflow: 'auto', margin: 0 }}>{error}</pre>
        <div style={{ color: '#94A3B8', maxWidth: 640, fontSize: '.85rem', lineHeight: 1.55, marginTop: 8 }}>
          If you are viewing this on a deployed site (e.g. Vercel), the backend must be publicly reachable — <code style={{ color: '#06B6D4' }}>localhost</code> only works when you are running the backend on the same machine as your browser. Deploy the backend to a public host (Render / Railway / Fly.io) and set the <code style={{ color: '#06B6D4' }}>VITE_API_BASE</code> environment variable in Vercel.
        </div>
        <button onClick={refresh} style={{ marginTop: 12, padding: '10px 22px', background: '#14B8A6', color: 'white', border: 0, borderRadius: 8, fontSize: '.9rem', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`app__main ${sidebarCollapsed ? 'app__main--expanded' : ''}`}>
        <Header activeSection={activeSection} />
        <div className={`app__content ${activeSection === 'overview' ? 'app__content--overview' : ''}`}>
          {activeSection === 'overview' && (
            <>
              {/* ── HERO BANNER ── */}
              <div className="hero-banner">
                <div className="hero-banner__overlay" />
                <div className="hero-banner__content">
                  <div className="hero-banner__badge">🇸🇱 Republic of Sierra Leone — Ministry of Health</div>
                  <h1 className="hero-banner__title">
                    Leveraging Health System Pillars and Levers to Improve Sexual and Reproductive Health and Rights (SRHR) in Sierra Leone
                  </h1>
                  <p className="hero-banner__sub">LAD Project Delivery Tracker</p>
                </div>
              </div>

              {/* ── ABOUT SECTION ── */}
              <section className="section about-section">
                <div className="about-section__inner">
                  <div className="about-section__icon-wrap">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h2 className="section__title about-section__title">About the Dashboard</h2>
                    <p className="about-section__text">
                      The Sierra Leone Ministry of Health is leveraging five Health System Pillars and Levers to improve Sexual and Reproductive Health and Rights (SRHR) in Sierra Leone through the implementation of a performance management system and the application of Deliverology® to support the leadership with data for decision-making. This dashboard visualises critical data to aid problem-solving and decision-making.
                    </p>
                  </div>
                </div>
              </section>

              {/* ── CENTRAL GOAL BANNER ── */}
              <section className="section central-goal-section">
                <div className="central-goal">
                  <div className="central-goal__label">Central Goal</div>
                  <h2 className="central-goal__title">{CENTRAL_GOAL.title}</h2>
                  <div className="central-goal__target">Target: <strong>{CENTRAL_GOAL.target}</strong></div>
                  <div className="central-goal__status">
                    <span className="central-goal__status-dot" />
                    Current Status: <strong>{CENTRAL_GOAL.status}</strong>
                  </div>
                </div>
              </section>

              {/* ── 5 KEY PILLARS ── */}
              <section className="section pillars-section">
                <div className="section__header">
                  <Target size={18} className="section__icon" />
                  <div>
                    <h2 className="section__title">5 Key Pillars</h2>
                    <p className="section__subtitle">Strategic levers driving SRHR improvements across Sierra Leone</p>
                  </div>
                </div>
                <div className="pillars-grid">
                  {HEALTH_PILLARS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div className="pillar-card" key={p.id} style={{ '--pc': p.color }}>
                        <div className="pillar-card__icon-wrap" style={{ background: `${p.color}1A`, color: p.color }}>
                          <Icon size={24} />
                        </div>
                        <div className="pillar-card__num">Pillar {p.id}</div>
                        <h3 className="pillar-card__title">{p.title}</h3>
                        <p className="pillar-card__desc">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Cross-cutting Pillar */}
                <div className="pillar-card pillar-card--cross" style={{ '--pc': CROSS_CUTTING_PILLAR.color }}>
                  <div className="pillar-card__icon-wrap" style={{ background: `${CROSS_CUTTING_PILLAR.color}1A`, color: CROSS_CUTTING_PILLAR.color }}>
                    <CROSS_CUTTING_PILLAR.icon size={22} />
                  </div>
                  <div>
                    <h3 className="pillar-card__title">{CROSS_CUTTING_PILLAR.title}</h3>
                    <p className="pillar-card__desc">{CROSS_CUTTING_PILLAR.desc}</p>
                  </div>
                </div>
              </section>

              {/* ── IMPLEMENTING ENTITIES ── */}
              <section className="section entities-section">
                <div className="section__header">
                  <Users size={18} className="section__icon" />
                  <div>
                    <h2 className="section__title">Implementing Entities</h2>
                    <p className="section__subtitle">Directorates and agencies responsible for programme delivery</p>
                  </div>
                </div>
                <div className="entities-grid">
                  {ENTITIES.map((e) => (
                    <div 
                      className="entity-chip" 
                      key={e.abbr} 
                      style={{ '--ec': e.color, cursor: 'pointer' }}
                      onClick={() => {
                        setOverviewEntity(e.id);
                        setActiveSection('analytics');
                      }}
                    >
                      <span className="entity-chip__dot" style={{ background: e.color }} />
                      <div className="entity-chip__info">
                        <span className="entity-chip__abbr" style={{ color: e.color }}>{e.abbr}</span>
                        <span className="entity-chip__name">{e.name}</span>
                      </div>
                      <ChevronRight size={14} className="entity-chip__arrow" />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {renderSection(activeSection, overviewEntity)}
        </div>
        <footer className="app__footer">
          <span>Ministry of Health — Sierra Leone</span>
          <span>LAD  SRHR Dashboard v2.0 </span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  );
}
