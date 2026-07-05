import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/ui/index.jsx';

function AuthLayout({ children, title, subtitle, side }) {
  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', position:'relative' }}>
      {/* Left panel */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'48px 40px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 30% 50%, rgba(0,255,163,0.04) 0%, transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0 }} className="hero-grid-bg" />

        <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>
          <Link to="/" style={{ textDecoration:'none', display:'block', marginBottom:40, textAlign:'center' }}>
            <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.5rem', fontWeight:900 }}>
              <span className="glow-green">JOE</span>
              <span style={{ color:'var(--text-main)' }}>AI</span>
              <span className="glow-yellow">LABS</span>
            </span>
          </Link>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.3rem,3vw,1.8rem)', color:'var(--neon-green)', marginBottom:8, letterSpacing:1 }}>{title}</h1>
            <p style={{ color:'var(--text-muted)', lineHeight:1.6 }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        background:'linear-gradient(135deg, rgba(0,255,163,0.04) 0%, rgba(0,212,255,0.02) 50%, rgba(255,214,0,0.02) 100%)',
        borderLeft:'1px solid rgba(0,255,163,0.08)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 40px',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', inset:0 }} className="hero-grid-bg" />
        <div style={{ position:'relative', zIndex:1, maxWidth:400, width:'100%' }}>{side}</div>
      </div>

      {/* Mobile: hide right panel below 768px */}
      <style>{`@media(max-width:768px){div[style*="gridTemplateColumns"]{grid-template-columns:1fr !important}div[style*="borderLeft"]{display:none !important}}`}</style>
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0' }}>
      <div style={{ width:32, height:32, borderRadius:8, background:'rgba(0,255,163,0.08)', border:'1px solid rgba(0,255,163,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--neon-green)', fontSize:'0.85rem', flexShrink:0 }}>
        <i className={`fas ${icon}`} />
      </div>
      <span style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>{text}</span>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const side = (
    <div>
      <div className="badge badge-green" style={{ marginBottom:24 }}>
        <i className="fas fa-shield-halved" /> SECURE LOGIN
      </div>
      <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.3rem', color:'var(--text-main)', marginBottom:8 }}>Welcome to Africa's AI Hub</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.88rem', lineHeight:1.7, marginBottom:28 }}>Join thousands of African creators, students, and freelancers building the future with AI.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        <FeatureItem icon="fa-robot" text="AI-powered learning experience" />
        <FeatureItem icon="fa-bolt" text="500+ curated AI prompt templates" />
        <FeatureItem icon="fa-users" text="Active African creator community" />
        <FeatureItem icon="fa-certificate" text="Earn verifiable AI certificates" />
        <FeatureItem icon="fa-graduation-cap" text="Structured AI modules & quizzes" />
      </div>
      <div className="divider" style={{ margin:'24px 0' }} />
      <div style={{ padding:'16px', background:'rgba(255,214,0,0.04)', border:'1px solid rgba(255,214,0,0.12)', borderRadius:12 }}>
        <p style={{ color:'var(--neon-yellow)', fontSize:'0.8rem', fontStyle:'italic', lineHeight:1.6 }}>
          "JOEAILABS gave me the AI skills to land my first freelance client. Worth every shilling."
        </p>
        <p style={{ color:'var(--text-dim)', fontSize:'0.72rem', marginTop:8 }}>— Amara K., Nairobi 🇰🇪</p>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="SIGN IN"
      subtitle="Enter your credentials to access your dashboard."
      side={side}
    >
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <label htmlFor="email">Email Address</label>
          <div style={{ position:'relative' }}>
            <i className="fas fa-envelope" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input
              id="email" type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              style={{ paddingLeft:40 }}
              autoComplete="email" required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <div style={{ position:'relative' }}>
            <i className="fas fa-lock" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input
              id="password" type={showPwd ? 'text' : 'password'} name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
              style={{ paddingLeft:40, paddingRight:44 }}
              autoComplete="current-password" required
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', padding:4 }}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full">
          {loading ? <><i className="fas fa-circle-notch fa-spin" /> SIGNING IN...</> : <><i className="fas fa-right-to-bracket" /> SIGN IN</>}
        </button>

        <div className="divider" style={{ margin:'4px 0' }}>
          <span style={{ color:'var(--text-dim)', fontSize:'0.78rem' }}>OR</span>
        </div>

        <p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:'0.88rem' }}>
          New to JOEAILABS?{' '}
          <Link to="/register" style={{ color:'var(--neon-green)', textDecoration:'none', fontWeight:700 }}>
            Create Account →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', confirmPassword:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.username.trim() || form.username.length < 3) return 'Username must be at least 3 characters.';
    if (!form.email.includes('@')) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!agreed) return 'You must agree to the terms.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try {
      await signup(form.username.trim(), form.email.toLowerCase().trim(), form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const pwdStrength = (() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthColors = ['var(--neon-red)', 'var(--neon-yellow)', 'var(--neon-yellow)', 'var(--neon-green)', 'var(--neon-green)'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const side = (
    <div>
      <div style={{ marginBottom:24 }}>
        <span className="badge badge-yellow"><i className="fas fa-rocket" /> START FREE</span>
      </div>
      <h2 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.2rem', color:'var(--text-main)', marginBottom:8 }}>Everything you need to master AI</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', lineHeight:1.7, marginBottom:24 }}>Free account includes access to beginner modules, 50+ prompt templates, and community chat.</p>

      <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:28 }}>
        <FeatureItem icon="fa-check-circle" text="Free forever for core features" />
        <FeatureItem icon="fa-check-circle" text="Access to AI learning modules" />
        <FeatureItem icon="fa-check-circle" text="50+ starter prompt templates" />
        <FeatureItem icon="fa-check-circle" text="Join the community chat" />
        <FeatureItem icon="fa-check-circle" text="Track your learning progress" />
      </div>

      <div style={{ padding:'16px', background:'rgba(0,255,163,0.04)', border:'1px solid rgba(0,255,163,0.12)', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:'1.8rem' }}>🌍</span>
        <div>
          <p style={{ color:'var(--neon-green)', fontSize:'0.82rem', fontWeight:700, marginBottom:2 }}>Built for Africa</p>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', lineHeight:1.5 }}>M-Pesa payments, KES pricing, Afrocentric AI education.</p>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="CREATE ACCOUNT"
      subtitle="Join JOEAILABS and start your AI journey today."
      side={side}
    >
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <label htmlFor="username">Username</label>
          <div style={{ position:'relative' }}>
            <i className="fas fa-user" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input
              id="username" name="username" placeholder="YourName"
              value={form.username} onChange={handleChange}
              style={{ paddingLeft:40 }} autoComplete="username" required
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email">Email Address</label>
          <div style={{ position:'relative' }}>
            <i className="fas fa-envelope" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input
              id="reg-email" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              style={{ paddingLeft:40 }} autoComplete="email" required
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password">Password</label>
          <div style={{ position:'relative' }}>
            <i className="fas fa-lock" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input
              id="reg-password" type={showPwd ? 'text' : 'password'} name="password"
              placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange}
              style={{ paddingLeft:40, paddingRight:44 }}
              autoComplete="new-password" required
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', padding:4 }}
            >
              <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {pwdStrength !== null && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= pwdStrength ? strengthColors[pwdStrength] : 'rgba(255,255,255,0.08)', transition:'background 0.3s' }} />
                ))}
              </div>
              <span style={{ fontSize:'0.72rem', color: strengthColors[pwdStrength] }}>{strengthLabels[pwdStrength]}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div style={{ position:'relative' }}>
            <i className={`fas ${form.confirmPassword && form.password === form.confirmPassword ? 'fa-check-circle' : 'fa-lock'}`}
              style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: form.confirmPassword && form.password === form.confirmPassword ? 'var(--neon-green)' : 'var(--text-dim)', fontSize:'0.85rem' }}
            />
            <input
              id="confirmPassword" type="password" name="confirmPassword"
              placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange}
              style={{ paddingLeft:40 }} autoComplete="new-password" required
            />
          </div>
        </div>

        <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', textTransform:'none', letterSpacing:0, fontSize:'0.82rem', color:'var(--text-muted)', fontWeight:400 }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            style={{ width:16, height:16, marginTop:2, accentColor:'var(--neon-green)', flexShrink:0 }}
          />
          I agree to the{' '}
          <a href="#" style={{ color:'var(--neon-green)', textDecoration:'none' }} onClick={e => e.preventDefault()}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color:'var(--neon-green)', textDecoration:'none' }} onClick={e => e.preventDefault()}>Privacy Policy</a>.
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full">
          {loading ? <><i className="fas fa-circle-notch fa-spin" /> CREATING ACCOUNT...</> : <><i className="fas fa-rocket" /> CREATE FREE ACCOUNT</>}
        </button>

        <p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:'0.88rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--neon-green)', textDecoration:'none', fontWeight:700 }}>
            Sign In →
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
