import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import { apiRequest, getSession, getTokens, selectBranch } from '../services/api';

type Branch = { branchId: string; name: string; address?: string | null };

export default function BranchSelection() {
  const navigate = useNavigate();
  const session = getSession();
  const userId = session?.userId;
  const allowedBranchIds = session?.branches.join('|') ?? '';
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void apiRequest<Branch[]>('/api/v1/branches/accessible').then((data) => {
      const allowed = new Set(allowedBranchIds.split('|').filter(Boolean));
      if (active) setBranches(data.filter((branch) => allowed.has(branch.branchId)));
    }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'Could not load your branches.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, allowedBranchIds]);

  if (!getTokens() || !session) return <Navigate to="/login" replace />;

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="panel" style={{ width: '480px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Select Branch</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Choose one of your authorized branches to continue.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading && <p role="status" style={{ color: 'var(--text-2)', fontSize: '14px', textAlign: 'center' }}>Loading your branches…</p>}
          {error && <p role="alert" style={{ color: 'var(--red)', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
          {!loading && !error && session.branches.length === 0 && (
            <p role="status" style={{ color: 'var(--text-2)', fontSize: '14px', textAlign: 'center' }}>
              Your account has no branch access. Ask an organization administrator to assign a branch.
            </p>
          )}
          {!loading && !error && branches.map((branch) => (
            <button
              key={branch.branchId}
              type="button"
              className="panel-header"
              onClick={() => { selectBranch(branch.branchId, branch.name); navigate('/dashboard', { replace: true }); }}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'left', background: 'transparent' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <Store size={20} style={{ color: 'var(--text)' }} />
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{branch.name}</span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-3)' }}>{branch.address || 'Authorized branch'}</span>
                </span>
              </span>
              <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
            </button>
          ))}
          {!loading && !error && session.branches.length > 0 && branches.length === 0 && <p role="alert" style={{ color: 'var(--red)', fontSize: '13px', textAlign: 'center' }}>Your branch permissions could not be matched. Please sign in again.</p>}
        </div>
      </div>
    </div>
  );
}

