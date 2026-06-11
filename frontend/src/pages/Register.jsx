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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid var(--color-border)', borderRadius: '8px', fontFamily: 'sans-serif', background: 'var(--color-card)' }}>
      <h2>Create Your Account </h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Full Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #aaa' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Email Address
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #aaa' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #aaa' }} />
        </label>
        
        <button type="submit" style={{ padding: '10px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sign Up
        </button>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;