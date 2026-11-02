import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, verifyMfa } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengeToken, setChallengeToken] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (challengeToken) {
        await verifyMfa(challengeToken, code.trim());
        navigate('/branch', { replace: true });
      } else {
        const result = await signIn(username.trim(), password);
        if ('challengeToken' in result) {
          setChallengeToken(result.challengeToken);
          setPassword('');
          setError('');
        } else {
          navigate('/branch', { replace: true });
        }
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          {challengeToken ? <>
            <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Enter the six-digit verification code for your account.</p>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="mfa-code">Verification code</label>
              <input id="mfa-code" type="text" className="form-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus />
            </div>
          </> : <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>}

          {error && <p role="alert" style={{ color: 'var(--red, #dc2626)', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center', padding: '10px', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Please wait…' : challengeToken ? 'Verify code' : 'Sign In'}
          </button>
          {challengeToken && <button type="button" className="btn" onClick={() => { setChallengeToken(''); setCode(''); setError(''); }}>Back to sign in</button>}
        </form>
      </div>
    </div>
  );
}

