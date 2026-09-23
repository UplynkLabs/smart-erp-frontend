import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Calendar, ChefHat, Package, MenuSquare, LayoutGrid, Truck, CreditCard, Receipt, Calculator, UserCircle, Clock, CircleDollarSign, PieChart, Settings, Bell, FileText, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">U</div>
        <div>
          <div className="logo-text">Uplynk ERP</div>
          <div className="logo-sub">Restaurant Cloud Platform</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Sales & Customers</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><LayoutDashboard size={16} /></span>
          Dashboard
        </NavLink>
        <NavLink to="/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><ShoppingBag size={16} /></span>
          Point of Sale
          <span className="nav-badge">3</span>
        </NavLink>
        <button className="nav-item">
          <span className="nav-icon"><Users size={16} /></span>
          Customers
        </button>
        <button className="nav-item">
          <span className="nav-icon"><Calendar size={16} /></span>
          Reservations
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Operations</div>
        <NavLink to="/kitchen" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><ChefHat size={16} /></span>
          Kitchen
          <span className="nav-badge">7</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Package size={16} /></span>
          Inventory
        </NavLink>
        <button className="nav-item">
          <span className="nav-icon"><MenuSquare size={16} /></span>
          Menu Management
        </button>
        <button className="nav-item">
          <span className="nav-icon"><LayoutGrid size={16} /></span>
          Table Management
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Supply & Finance</div>
        <button className="nav-item">
          <span className="nav-icon"><Truck size={16} /></span>
          Suppliers
        </button>
        <button className="nav-item">
          <span className="nav-icon"><CreditCard size={16} /></span>
          Purchases
        </button>
        <button className="nav-item">
          <span className="nav-icon"><Receipt size={16} /></span>
          Expenses
        </button>
        <button className="nav-item">
          <span className="nav-icon"><Calculator size={16} /></span>
          Accounting
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">HR</div>
        <button className="nav-item">
          <span className="nav-icon"><UserCircle size={16} /></span>
          Employees
        </button>
        <button className="nav-item">
          <span className="nav-icon"><Clock size={16} /></span>
          Attendance
        </button>
        <button className="nav-item">
          <span className="nav-icon"><CircleDollarSign size={16} /></span>
          Payroll
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">System & Admin</div>
        <button className="nav-item">
          <span className="nav-icon"><PieChart size={16} /></span>
          Reports
        </button>
        <button className="nav-item">
          <span className="nav-icon"><Settings size={16} /></span>
          Settings
        </button>
        <button className="nav-item">
          <span className="nav-icon"><Bell size={16} /></span>
          Notifications
        </button>
        <button className="nav-item">
          <span className="nav-icon"><FileText size={16} /></span>
          Audit Logs
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="dropdown" style={{ width: '100%' }}>
          <div className="user-row" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('active')}>
            <div className="avatar">AH</div>
            <div className="user-info">
              <div className="name" id="current-user-name">Admin User</div>
              <div className="role" id="current-user-role">Super Admin</div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-3)', marginLeft: 'auto' }} />
          </div>
          {/* Menu omitted for brevity, logic handled in Layout if needed */}
        </div>
      </div>
    </aside>
  );
}
