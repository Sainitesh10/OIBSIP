import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Input OTP & New Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Send password reset code
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');

    setError('');
    setSuccess('');
    setLoading(true);

    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSuccess('Reset code sent to email! Check server logs for the OTP preview.');
      setTimeout(() => {
        setStep(2);
        setError('');
        setSuccess('');
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const result = await resetPassword(email, otp, password);
    setLoading(false);

    if (result.success) {
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            🔑 Reset Password
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {step === 1 ? 'Request Reset Code' : 'Update Password'}
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

        {step === 1 ? (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            <button
              type="submit"
              className={`btn-cyber btn-cyan ${loading ? 'btn-disabled' : ''}`}
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                6-Digit Reset Code
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
                New Password
              </label>
              <input
                type="password"
                className="input-cyber"
                placeholder="Min. 6 characters"
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
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-cyber"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn-cyber btn-cyan ${loading ? 'btn-disabled' : ''}`}
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: 'var(--muted)',
        }}>
          Remembered password?{' '}
          <Link to="/login" style={{
            color: 'var(--accent-cyan)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
