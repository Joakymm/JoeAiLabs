import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Alert } from '../../components/ui/index.jsx';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setMsg(data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm" style={{ padding: '80px 24px' }}>
      <div className="card" style={{ padding: 40, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
          <h2 style={{ fontFamily: 'Orbitron,sans-serif', color: 'var(--neon-green)', marginBottom: 8 }}>NEW CREDENTIALS</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Choose a new password for your account.</p>
        </div>
        {msg && <Alert type="success">{msg}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="New password (min 6 chars)" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={6}
            style={{ width: '100%', marginBottom: 12, padding: '12px 16px' }} />
          <input type="password" placeholder="Confirm new password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} required
            style={{ width: '100%', marginBottom: 16, padding: '12px 16px' }} />
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? <><i className="fas fa-circle-notch fa-spin" /> RESETTING...</> : 'RESET PASSWORD'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--neon-green)', fontSize: '0.85rem' }}>← BACK TO LOGIN</Link>
        </div>
      </div>
    </div>
  );
}
