import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter all fields');
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      if (result.notVerified) {
        // Redirect to email verification page with email in state
        navigate('/verify', { state: { email } });
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="glass-card animate-slideup" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 900,
            fontSize: '28px',
            color: 'var(--accent-cyan)',
            letterSpacing: '-1px',
            textShadow: '0 0 10px rgba(0, 245, 255, 0.4)',
            marginBottom: '10px',
          }}>
            🍕 PizzaFlow
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            System Login
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid var(--accent-orange)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--accent-orange)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-cyber"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Password
              </label>
              <Link to="/forgot-password" style={{
                fontSize: '11px',
                color: 'var(--accent-orange)',
                textDecoration: 'none',
                fontWeight: 600,
              }}>
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              className="input-cyber"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn-cyber btn-cyan ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          fontSize: '13px',
          color: 'var(--muted)',
        }}>
          New user?{' '}
          <Link to="/register" style={{
            color: 'var(--accent-cyan)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
