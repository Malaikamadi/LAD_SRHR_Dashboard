import { Bell, User, ChevronRight, Calendar } from 'lucide-react';
import './Header.css';
const sectionTitles = { 'overview':'Executive Overview','map':'Implementing Entities Location','analytics':'Implementing Entities Analytics','burn-rate':'Burn Rate','procurement':'Procurement Tracker','operational':'Operational Tracker','milestones':'Milestone Tracking' };
export default function Header({ activeSection }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__breadcrumb"><span>Dashboard</span><ChevronRight size={13}/><span className="header__breadcrumb-current">{sectionTitles[activeSection]}</span></div>
        <h1 className="header__title">{sectionTitles[activeSection]}</h1>
      </div>
      <div className="header__right">
        <div className="header__date"><Calendar size={13}/><span>{dateStr}</span></div>
        <button className="header__icon-btn"><Bell size={17}/><span className="header__notification-dot"/></button>
        <div className="header__user"><div className="header__avatar"><User size={15}/></div><div className="header__user-info"><span className="header__user-name">MoHS Admin</span><span className="header__user-role">System Administrator</span></div></div>
      </div>
    </header>
  );
}
