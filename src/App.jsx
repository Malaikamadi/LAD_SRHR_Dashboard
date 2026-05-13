import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import HealthMap from './components/HealthMap';
import AnalyticsSection from './components/AnalyticsSection';
import BurnRate from './components/BurnRate';
import ProcurementTracker from './components/ProcurementTracker';
import MilestoneTracking from './components/MilestoneTracking';
import {
  Search, HeartPulse, Building2, BarChart3, GraduationCap,
  Landmark, Package, ShieldCheck, BookOpen, Stethoscope,
  ClipboardList, Users, Activity, Target, ChevronRight
} from 'lucide-react';
import './App.css';

const HEALTH_PILLARS = [
  { id: 1, title: 'Create awareness and generate evidence', desc: 'Address critical barriers to access SRH services', icon: Search, color: '#0F766E' },
  { id: 2, title: 'Sustainable health financing', desc: 'Adopt and institutionalize through social health insurance (SLeSHI)', icon: Landmark, color: '#0891B2' },
  { id: 3, title: 'Increase health professionals', desc: 'Improve SRH services by increasing the quantity and quality of health professionals', icon: GraduationCap, color: '#7C3AED' },
  { id: 4, title: 'Real-time SRH data', desc: 'Inform decision-making and align data generation cycles with decision-makers\' needs', icon: BarChart3, color: '#2563EB' },
  { id: 5, title: 'Expand service infrastructure', desc: 'Expand integrated SRH service infrastructure and referral systems', icon: Building2, color: '#D97706' },
  { id: 6, title: 'Uninterrupted supply chain', desc: 'Ensure uninterrupted supply and availability of SRH commodities in health facilities', icon: Package, color: '#DC2626' },
  { id: 7, title: 'Program leadership & governance', desc: 'Improve SRHR program leadership and governance', icon: ShieldCheck, color: '#059669' },
];

const ENTITIES = [
  { name: 'Sierra Leone Social Health Insurance', abbr: 'SLESHI', color: '#0F766E' },
  { name: 'Directorate of Reproductive and Child Health', abbr: 'RCH', color: '#2563EB' },
  { name: 'Directorate of Primary Health Care', abbr: 'PHC', color: '#7C3AED' },
  { name: 'Directorate of Policy Planning and Information', abbr: 'DPPI', color: '#D97706' },
  { name: 'Directorate of National Emergency Medical Services', abbr: 'NEMS', color: '#DC2626' },
  { name: 'Directorate of Donor Coordination', abbr: 'Donor Coordination', color: '#0891B2' },
  { name: 'Directorate of College of Medicine and Allied Health Sciences', abbr: 'COMAHS', color: '#059669' },
  { name: 'Directorate of Gender Sciences', abbr: 'Gender', color: '#DB2777' },
  { name: 'Directorate of Post Graduate College of Health Specialties', abbr: 'PGCHS', color: '#4F46E5' },
  { name: 'National Medical Supplies Agency', abbr: 'NMSA', color: '#EA580C' },
];

function renderSection(section) {
  switch (section) {
    case 'overview': return <KPICards />;
    case 'map': return <HealthMap />;
    case 'analytics': return <AnalyticsSection />;
    case 'burn-rate': return <BurnRate />;
    case 'procurement': return <ProcurementTracker />;
    case 'milestones': return <MilestoneTracking />;
    default: return <KPICards />;
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`app__main ${sidebarCollapsed ? 'app__main--expanded' : ''}`}>
        <Header activeSection={activeSection} />
        <div className="app__content">
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
              <section className="about-section">
                <div className="about-section__inner">
                  <div className="about-section__icon-wrap">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h2 className="about-section__title">About the Dashboard</h2>
                    <p className="about-section__text">
                      The Sierra Leone Ministry of Health is leveraging seven Health System Pillars and Levers to improve Sexual and Reproductive Health and Rights (SRHR) in Sierra Leone through the implementation of a performance management system and the application of Deliverology® to support the leadership with data for decision-making. This dashboard visualises critical data to aid problem-solving and decision-making.
                    </p>
                  </div>
                </div>
              </section>

              {/* ── HEALTH PILLARS ── */}
              <section className="pillars-section">
                <div className="pillars-section__header">
                  <div className="pillars-section__header-left">
                    <Target size={20} className="pillars-section__icon" />
                    <div>
                      <h2 className="pillars-section__title">Seven Health System Pillars</h2>
                      <p className="pillars-section__subtitle">Strategic objectives driving SRHR improvements across Sierra Leone</p>
                    </div>
                  </div>
                </div>
                <div className="pillars-grid">
                  {HEALTH_PILLARS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div className="pillar-card" key={p.id} style={{ '--pc': p.color }}>
                        <div className="pillar-card__icon-wrap" style={{ background: `${p.color}12`, color: p.color }}>
                          <Icon size={26} />
                        </div>
                        <div className="pillar-card__num">Pillar {p.id}</div>
                        <h3 className="pillar-card__title">{p.title}</h3>
                        <p className="pillar-card__desc">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── IMPLEMENTING ENTITIES ── */}
              <section className="entities-section">
                <div className="entities-section__header">
                  <Users size={20} className="entities-section__icon" />
                  <div>
                    <h2 className="entities-section__title">Implementing Entities</h2>
                    <p className="entities-section__subtitle">Directorates and agencies responsible for programme delivery</p>
                  </div>
                </div>
                <div className="entities-grid">
                  {ENTITIES.map((e) => (
                    <div className="entity-chip" key={e.abbr} style={{ '--ec': e.color }}>
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
          {renderSection(activeSection)}
        </div>
        <footer className="app__footer">
          <span>Ministry of Health — Sierra Leone</span>
          <span>LAD  SRHR Dashboard v2.0 </span>
        </footer>
      </main>
    </div>
  );
}
