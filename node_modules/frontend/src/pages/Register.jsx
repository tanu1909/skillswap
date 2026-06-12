import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-soft)' }}>
      <div style={{ width: '100%', maxWidth: '450px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '36px 28px', boxShadow: '0 28px 70px rgba(113, 83, 205, 0.12)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '28px', fontWeight: 'bold' }}>Create your SkillSwap account</h2>
          <p style={{ margin: '10px 0 0', color: 'var(--color-muted)', lineHeight: '1.6' }}>Join the community and start swapping skills today.</p>
        </div>

        {error && <p style={{ color: '#D9418D', fontWeight: '600', marginBottom: '18px' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', fontWeight: '600' }}>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', outline: 'none' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', fontWeight: '600' }}>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', outline: 'none' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', fontWeight: '600' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', outline: 'none' }}
            />
          </label>

          <button type="submit" style={{ padding: '14px 18px', background: '#A974FF', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 8px 20px rgba(169, 116, 255, 0.18)' }}>
            Sign Up
          </button>

          <p style={{ textAlign: 'center', margin: 0, color: 'var(--color-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: '#8F7BFF', textDecoration: 'none', fontWeight: '700' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;