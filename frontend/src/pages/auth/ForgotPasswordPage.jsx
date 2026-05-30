import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Alert } from '../../components/ui/index.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMsg(data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm" style={{ padding: '80px 24px' }}>
      <div className="card" style={{ padding: 40, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔑</div>
          <h2 style={{ fontFamily: 'Orbitron,sans-serif', color: 'var(--neon-green)', marginBottom: 8 }}>RESET ACCESS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter your email to receive a password reset link.</p>
        </div>
        {msg && <Alert type="success">{msg}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', marginBottom: 16, padding: '12px 16px' }} />
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? <><i className="fas fa-circle-notch fa-spin" /> SENDING...</> : 'SEND RESET LINK'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--neon-green)', fontSize: '0.85rem' }}>← BACK TO LOGIN</Link>
        </div>
      </div>
    </div>
  );
}
