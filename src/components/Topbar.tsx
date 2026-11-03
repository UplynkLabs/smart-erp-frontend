import { Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getActiveBranchId, getActiveBranchName, getSession } from '../services/api';

export default function Topbar() {
  const location = useLocation();
  const session = getSession();
  const titles: Record<string, string> = { '/dashboard': 'Dashboard', '/pos': 'Point of Sale', '/kitchen': 'Kitchen', '/inventory': 'Inventory', '/customers': 'Customers', '/suppliers': 'Suppliers', '/purchases': 'Purchases', '/payables': 'Payables', '/expenses': 'Expenses', '/accounting': 'Accounting', '/reports': 'Reports', '/audit': 'Audit logs' };
  const activeBranch = getActiveBranchId();
  const branchLabel = getActiveBranchName() ?? (activeBranch ? `Branch ${activeBranch.slice(0, 8)}` : 'Select a branch');
  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>Uplynk ERP</span>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="current" id="topbar-title">{titles[location.pathname] ?? 'Uplynk ERP'}</span>
      </div>

      <div className="global-search">
        <Search className="search-icon" size={16} />
        <input type="text" placeholder="Search customers, orders, products..." />
      </div>

      <div className="topbar-right">
        <div className="dropdown">
          <div className="branch-pill" title={activeBranch ?? undefined}>
            <div className="branch-dot"></div>
            {branchLabel}
          </div>
        </div>
        
        <div className="icon-btn">
          <Bell size={16} />
          <div className="notif-dot"></div>
        </div>
        <div className="topbar-user">{session?.fullName ?? 'User'}</div>
      </div>
    </header>
  );
}

