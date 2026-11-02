import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import { getSession, getTokens, selectBranch } from '../services/api';

export default function BranchSelection() {
  const navigate = useNavigate();
  const session = getSession();

  if (!getTokens() || !session) return <Navigate to="/login" replace />;

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="panel" style={{ width: '480px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Select Branch</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Choose one of your authorized branches to continue.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {session.branches.length === 0 && (
            <p role="status" style={{ color: 'var(--text-2)', fontSize: '14px', textAlign: 'center' }}>
              Your account has no branch access. Ask an organization administrator to assign a branch.
            </p>
          )}
          {session.branches.map((branchId) => (
            <button
              key={branchId}
              type="button"
              className="panel-header"
              onClick={() => { selectBranch(branchId); navigate('/pos', { replace: true }); }}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', background: 'transparent' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <Store size={20} style={{ color: 'var(--text)' }} />
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>Authorized branch</span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-3)', fontFamily: 'monospace' }}>{branchId}</span>
                </span>
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

