import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight } from 'lucide-react';

export default function BranchSelection() {
  const navigate = useNavigate();

  const branches = [
    { id: 1, name: 'Main Branch', location: 'Downtown', active: true },
    { id: 2, name: 'Northside Mall', location: 'Northside', active: true },
    { id: 3, name: 'Airport Kiosk', location: 'Terminal 1', active: false },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="panel" style={{ width: '480px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Select Branch</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Choose a location to continue to your dashboard.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {branches.map(branch => (
            <div 
              key={branch.id} 
              className={`panel-header ${!branch.active ? 'disabled' : ''}`}
              style={{ 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius)', 
                cursor: branch.active ? 'pointer' : 'not-allowed',
                transition: 'border-color 0.2s',
                opacity: branch.active ? 1 : 0.5
              }}
              onClick={() => branch.active && navigate('/pos')}
              onMouseOver={(e) => { if(branch.active) e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <Store size={20} style={{ color: 'var(--text)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>{branch.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>{branch.location}</div>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
