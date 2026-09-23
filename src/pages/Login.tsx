import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to branch selection
    navigate('/branch');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="panel" style={{ width: '400px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="logo-mark" style={{ margin: '0 auto 16px' }}>U</div>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: '24px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Sign in to Uplynk</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
