import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { verifyEmail } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to parse email from redirect state
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      return setError('Please enter your email and OTP code');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const result = await verifyEmail(email, otp);
    setLoading(false);

    if (result.success) {
      setSuccess('Account verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
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
        maxWidth: '420px',
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
            📨 Verify Email
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Enter Verification OTP
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

        {success && (
          <div style={{
            background: 'rgba(0, 230, 118, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: '8px',
            padding: '10px',
            color: 'var(--accent-green)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 500,
          }}>
            ✅ {success}
          </div>
        )}

        <div style={{
          background: 'rgba(0, 245, 255, 0.05)',
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '12px',
          lineHeight: '1.5',
          color: 'var(--text)',
          marginBottom: '24px',
        }}>
          💡 <strong>Testing Tip:</strong> Check your **server console/terminal logs**. Look for the `📧 EMAIL SENT` logs. You will see a link labeled `🔗 View test email inbox here`. Open that link in your browser to grab your 6-digit OTP code!
        </div>

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
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}>
              6-Digit OTP Code
            </label>
            <input
              type="text"
              className="input-cyber"
              placeholder="e.g. 123456"
              maxLength="6"
              style={{
                textAlign: 'center',
                letterSpacing: '8px',
                fontSize: '20px',
                fontFamily: 'Share Tech Mono, monospace',
                fontWeight: 900,
              }}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn-cyber btn-cyan ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Verifying OTP...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
