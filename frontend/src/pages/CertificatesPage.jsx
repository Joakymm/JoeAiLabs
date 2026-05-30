import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, Alert } from '../components/ui/index.jsx';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/certificates').then(({ data }) => {
      setCerts(data.data || []);
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to load certificates.');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="LOADING CERTIFICATES" />;

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <span className="badge badge-green" style={{ marginBottom: 12 }}>ACHIEVEMENT UNLOCKS</span>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 8 }}>
          CERTIFICATE NEXUS
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete all lessons in a module to unlock your completion certificate.</p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {certs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <i className="fas fa-certificate" style={{ fontSize: '3rem', color: 'var(--neon-yellow)', marginBottom: 16, opacity: 0.4 }} />
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', color: 'var(--text-muted)', marginBottom: 8 }}>NO CERTIFICATES YET</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Complete all lessons in a module to earn your first certificate.</p>
          <Link to="/modules" className="btn btn-primary"><i className="fas fa-book" /> BROWSE MODULES</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {certs.map(cert => (
            <div key={cert._id} className="card" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', gap: 16, flexWrap: 'wrap',
              borderLeft: '4px solid var(--neon-yellow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,214,0,0.1)', border: '2px solid rgba(255,214,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fas fa-certificate" style={{ fontSize: '1.3rem', color: 'var(--neon-yellow)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{cert.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <i className="fas fa-hashtag" style={{ marginRight: 4 }} />{cert.certId}
                    <span style={{ margin: '0 8px' }}>•</span>
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/certificates/${cert._id}`} className="btn btn-ghost btn-sm">
                  <i className="fas fa-eye" /> VIEW
                </Link>
                <button className="btn btn-secondary btn-sm"
                  onClick={() => window.open(`/api/certificates/verify/${cert.certId}`, '_blank')}>
                  <i className="fas fa-shield" /> VERIFY
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
