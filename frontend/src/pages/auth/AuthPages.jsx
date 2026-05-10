import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui/index.jsx';

/* ── Shared auth card wrapper ─────────────────────────────────────────────── */
function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px',
      background:'radial-gradient(ellipse at 50% 0%, rgba(0,255,163,0.05) 0%, transparent 60%)' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.8rem', fontWeight:900 }}>
              <span style={{ color:'var(--neon-green)', textShadow:'0 0 20px rgba(0,255,163,0.5)' }}>JOE</span>
              <span style={{ color:'#fff' }}>AI</span>
              <span style={{ color:'var(--neon-yellow)' }}>LABS</span>
            </span>
          </Link>
        </div>

        <div className="card" style={{ borderTop:'2px solid var(--neon-green)', boxShadow:'0 0 60px rgba(0,255,163,0.08)' }}>
          <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.2rem', color:'var(--neon-green)', marginBottom:6, letterSpacing:2 }}>{title}</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:28 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Login ───────────────────────────────────────────────────────────────── */
export function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const redirect    = params.get('redirect') || '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const registered = params.get('registered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true); setError('');
    try   { await login(email, password); navigate(redirect); }
    catch (err) { setError(err.response?.data?.message || 'Login failed. Check your credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <AuthCard title="WELCOME BACK" subtitle="Sign in to continue your AI journey">
      {registered && <Alert type="success">Account created! Sign in to get started.</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:18 }}>
          <label>Email Address</label>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom:28 }}>
          <label>Password</label>
          <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <><i className="fas fa-circle-notch fa-spin" /> Signing in...</> : <><i className="fas fa-right-to-bracket" /> SIGN IN</>}
        </button>
      </form>

      <div style={{ textAlign:'center', marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>No account? </span>
        <Link to="/register" style={{ color:'var(--neon-green)', fontWeight:700, textDecoration:'none' }}>Create one free →</Link>
      </div>

      {/* Demo credentials hint */}
      <div style={{ marginTop:16, padding:'10px 14px', background:'rgba(0,255,163,0.04)', borderRadius:8, border:'1px solid rgba(0,255,163,0.1)' }}>
        <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', margin:0 }}>
          <i className="fas fa-circle-info" style={{ color:'var(--neon-blue)', marginRight:6 }} />
          Demo: <code style={{ color:'var(--neon-green)' }}>demo@joeailabs.com</code> / <code style={{ color:'var(--neon-green)' }}>demo1234</code>
        </p>
      </div>
    </AuthCard>
  );
}

/* ── Register ─────────────────────────────────────────────────────────────── */
export function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form,    setForm]    = useState({ username:'', email:'', password:'', confirmPassword:'', fullName:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, fullName } = form;
    if (!username || !email || !password) { setError('All fields are required.'); return; }
    if (password.length < 6)             { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword)    { setError('Passwords do not match.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username may only contain letters, numbers, and underscores.'); return; }
    setLoading(true); setError('');
    try   { await register({ username, email, password, fullName: fullName || username }); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const fields = [
    { label:'Full Name',         name:'fullName',         type:'text',     placeholder:'Joakim Ngiciri',        required:false },
    { label:'Username',          name:'username',         type:'text',     placeholder:'joetechie',              required:true  },
    { label:'Email Address',     name:'email',            type:'email',    placeholder:'your@email.com',         required:true  },
    { label:'Password',          name:'password',         type:'password', placeholder:'Min 6 characters',       required:true  },
    { label:'Confirm Password',  name:'confirmPassword',  type:'password', placeholder:'Repeat your password',   required:true  },
  ];

  return (
    <AuthCard title="CREATE ACCOUNT" subtitle="Join JOEAILABS — it's free to start">
      {error && <Alert type="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        {fields.map(f => (
          <div key={f.name} style={{ marginBottom:14 }}>
            <label>{f.label}{!f.required && <span style={{ color:'var(--text-dim)', marginLeft:6 }}>(optional)</span>}</label>
            <input type={f.type} name={f.name} placeholder={f.placeholder} value={form[f.name]} onChange={change} required={f.required} />
          </div>
        ))}
        <button type="submit" className="btn btn-yellow btn-full" style={{ marginTop:10 }} disabled={loading}>
          {loading ? <><i className="fas fa-circle-notch fa-spin" /> Creating...</> : <><i className="fas fa-rocket" /> CREATE FREE ACCOUNT</>}
        </button>
      </form>
      <div style={{ textAlign:'center', marginTop:20, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>Already have an account? </span>
        <Link to="/login" style={{ color:'var(--neon-green)', fontWeight:700, textDecoration:'none' }}>Sign in →</Link>
      </div>
    </AuthCard>
  );
}
