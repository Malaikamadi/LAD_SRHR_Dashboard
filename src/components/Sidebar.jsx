import { useState } from 'react';
import { LayoutDashboard, Map, BarChart3, Flame, Handshake, ShoppingCart, Flag, ChevronLeft, ChevronRight, Search, Menu, X } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'Executive Overview' },
  { id: 'milestones', icon: Flag, label: 'Milestone Tracking' },
  { id: 'map', icon: Map, label: 'Implementing Entities Location' },
  { id: 'analytics', icon: BarChart3, label: 'Implementing Entities Analytics' },
  { id: 'burn-rate', icon: Flame, label: 'Burn Rate' },
  { id: 'procurement', icon: ShoppingCart, label: 'Procurement Tracker' },
];

export default function Sidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <button className="sidebar-mobile-trigger" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon"><img src="/mohs-logo.png" alt="MoHS Logo" className="sidebar__logo-img" /></div>
          {!collapsed && <div className="sidebar__logo-text"><span className="sidebar__logo-title">LAD SRHR Dashboard</span><span className="sidebar__logo-subtitle">Ministry of Health</span></div>}
          <button className="sidebar__mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        </div>
        {!collapsed && <div className="sidebar__search"><Search size={15} className="sidebar__search-icon" /><input type="text" placeholder="Search..." className="sidebar__search-input" /></div>}
        <nav className="sidebar__nav">
          <div className="sidebar__nav-group-label">{!collapsed && 'NAVIGATION'}</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button key={item.id} className={`sidebar__nav-item ${isActive?'sidebar__nav-item--active':''}`} onClick={() => { onSectionChange(item.id); setMobileOpen(false); }} title={collapsed?item.label:undefined}>
                <div className="sidebar__nav-icon"><Icon size={19} /></div>
                {!collapsed && <span className="sidebar__nav-label-text">{item.label}</span>}
                {isActive && <div className="sidebar__nav-indicator" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar__bottom">
          {!collapsed && <div className="sidebar__status"><div className="sidebar__status-dot" /><span>System Online</span></div>}
          <button className="sidebar__collapse-btn" onClick={onToggleCollapse}>{collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}</button>
        </div>
      </aside>
    </>
  );
}
