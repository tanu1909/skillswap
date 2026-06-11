import React, {useState} from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate, Link } from 'react-router-dom';

function Login(){
    const navigate = useNavigate();
    const[email, setEmail] = useState(' ');
    const[password, setPassword] = useState(' ');
    const[error, setError] = useState(' ');
    const{login} = useAuth();


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
        <div>
            <h2>Sign In to SkillSpace</h2>
            {error && <p style={{color:'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>

                <label >
                    Email Address 
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{padding: '8px', border: '1px solid #aaa'}} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #aaa' }} />
                </label>

                <button type="submit" style={{ padding: '10px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Login
                </button>

                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </form>
        </div>
     );


}

 export default Login;