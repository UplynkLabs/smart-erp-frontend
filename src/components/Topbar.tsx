import React from 'react';
import { Search, ChevronDown, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>Uplynk ERP</span>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="current" id="topbar-title">Dashboard</span>
      </div>

      <div className="global-search">
        <Search className="search-icon" size={16} />
        <input type="text" placeholder="Search customers, orders, products..." />
      </div>

      <div className="topbar-right">
        <div className="dropdown">
          <div className="branch-pill" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('active')}>
            <div className="branch-dot"></div>
            Main Branch
            <ChevronDown size={12} />
          </div>
          <div className="dropdown-menu">
            <div className="dropdown-header">The Burger House</div>
            <div className="dropdown-item"><div className="branch-dot"></div> Main Branch</div>
            <div className="dropdown-item"><div className="branch-dot" style={{ background: 'var(--surface-3)' }}></div> Downtown Branch</div>
          </div>
        </div>
        
        <div className="icon-btn">
          <Bell size={16} />
          <div className="notif-dot"></div>
        </div>
      </div>
    </header>
  );
}
