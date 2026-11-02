import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, ChefHat, Package, Truck, CreditCard, Receipt, PieChart, ChevronRight, CircleDollarSign, Calculator, ScrollText } from 'lucide-react';
import { getSession, signOut } from '../services/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const session = getSession();
  const displayName = session?.fullName ?? 'User';
  const initials = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const role = session?.roles[0]?.replaceAll('_', ' ') ?? 'Team member';
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
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Users size={16} /></span>
          Customers
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Operations</div>
        <NavLink to="/kitchen" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><ChefHat size={16} /></span>
          Kitchen
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Package size={16} /></span>
          Inventory
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Supply & Finance</div>
        <NavLink to="/suppliers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Truck size={16} /></span>
          Suppliers
        </NavLink>
        <NavLink to="/purchases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><CreditCard size={16} /></span>
          Purchases
        </NavLink>
        <NavLink to="/payables" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><CircleDollarSign size={16} /></span>
          Payables
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Receipt size={16} /></span>
          Expenses
        </NavLink>
        <NavLink to="/accounting" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Calculator size={16} /></span>
          Accounting
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">System & Admin</div>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><PieChart size={16} /></span>
          Reports
        </NavLink>
        <NavLink to="/audit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><ScrollText size={16} /></span>
          Audit logs
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="dropdown" style={{ width: '100%' }}>
          <button className="user-row" type="button" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('active')}>
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="name" id="current-user-name">{displayName}</div>
              <div className="role" id="current-user-role">{role}</div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-3)', marginLeft: 'auto' }} />
          </button>
          <div className="dropdown-menu"><button className="dropdown-item danger" type="button" onClick={() => { signOut(); navigate('/login', { replace: true }); }}>Sign out</button></div>
        </div>
      </div>
    </aside>
  );
}

