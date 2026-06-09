import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // default role selection
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setError('');
    setLoading(true);

    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      // Redirect to OTP validation screen with email state payload
      navigate('/verify', { state: { email } });
    } else {
      setError(result.message);
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
        maxWidth: '440px',
        padding: '40px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 900,
            fontSize: '28px',
            color: 'var(--accent-cyan)',
            letterSpacing: '-1px',
            textShadow: '0 0 10px rgba(0, 245, 255, 0.4)',
            marginBottom: '6px',
          }}>
            🍕 PizzaFlow
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Account Registration
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid var(--accent-orange)',
            borderRadius: '8px',
            padding: '10px',
            color: 'var(--accent-orange)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-cyber"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-cyber"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px',
              }}>
                Password
              </label>
              <input
                type="password"
                className="input-cyber"
                placeholder="Min. 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px',
              }}>
                Confirm Pwd
              </label>
              <input
                type="password"
                className="input-cyber"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}>
              Choose System Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-cyber"
              style={{
                cursor: 'pointer',
                background: 'rgba(10, 10, 20, 0.9)',
                color: '#fff',
              }}
            >
              <option value="user">👨‍🍳 Customer / User</option>
              <option value="admin">⚙️ Store Administrator (Admin)</option>
            </select>
            <p style={{ color: 'var(--muted)', fontSize: '10px', marginTop: '4px', fontStyle: 'italic' }}>
              * Choose 'Store Administrator' to test low-stock notification triggers & dispatching dashboards.
            </p>
          </div>

          <button
            type="submit"
            className={`btn-cyber btn-cyan ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: 'var(--muted)',
        }}>
          Already registered?{' '}
          <Link to="/login" style={{
            color: 'var(--accent-cyan)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
