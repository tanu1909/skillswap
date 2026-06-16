import React, {useState} from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();


     const handleSubmit = async(e) => {
        e.preventDefault();
        setError(' ');
        try{
            await login({email, password});
            navigate('/dashboard');
        }catch(err){
            setError(err.response?.data?.message || 'Something went wrong');
        }
     };








     return(
        <div style={{ minHeight: '100vh', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-soft)' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '36px 28px', boxShadow: '0 24px 60px rgba(113, 83, 205, 0.12)' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '28px', fontWeight: 'bold' }}>Sign in to SkillSwap</h2>
                    <p style={{ margin: '10px 0 0', color: 'var(--color-muted)', lineHeight: '1.6' }}>Welcome back — enter your details to continue learning and teaching.</p>
                </div>

                {error && <p style={{ color: '#D9418D', fontWeight: '600', marginBottom: '18px' }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', fontWeight: '600' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={18} /> Email Address</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', outline: 'none' }} />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', fontWeight: '600' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={18} /> Password</span>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', outline: 'none' }} />
                    </label>

                    <button type="submit" style={{ padding: '14px 18px', background: '#8F7BFF', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 8px 20px rgba(143, 123, 255, 0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogIn size={18} /> Login
                    </button>

                    <p style={{ textAlign: 'center', margin: 0, color: 'var(--color-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#A974FF', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><UserPlus size={16} /> Create one</Link>
                    </p>
                </form>
            </div>
        </div>
     );


}

 export default Login;