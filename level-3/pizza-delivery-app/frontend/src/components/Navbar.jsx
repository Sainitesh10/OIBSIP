import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 10, 20, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      padding: '16px 5%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link to="/" style={{
          textDecoration: 'none',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 900,
          fontSize: '20px',
          color: 'var(--accent-cyan)',
          letterSpacing: '-1px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textShadow: '0 0 10px rgba(0, 245, 255, 0.4)',
        }}>
          <span>🍕</span> PizzaFlow
        </Link>

        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={{
            color: 'var(--text)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
             onMouseOut={(e) => e.target.style.color = 'var(--text)'}>
            Dashboard
          </Link>
          
          <Link to="/orders" style={{
            color: 'var(--text)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'}
             onMouseOut={(e) => e.target.style.color = 'var(--text)'}>
            My Orders
          </Link>

          {user.role === 'admin' && (
            <Link to="/admin" style={{
              color: 'var(--accent-orange)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              transition: 'color 0.2s',
            }} onMouseOver={(e) => e.target.style.color = '#fff'}
               onMouseOut={(e) => e.target.style.color = 'var(--accent-orange)'}>
              ⚙️ Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            {user.name}
          </div>
          <div style={{
            fontSize: '10px',
            color: user.role === 'admin' ? 'var(--accent-orange)' : 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 700,
          }}>
            {user.role}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-cyber btn-orange"
          style={{
            padding: '8px 16px',
            fontSize: '11px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
