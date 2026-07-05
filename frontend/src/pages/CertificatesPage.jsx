import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Spinner, Alert, EmptyState } from '../components/ui/index.jsx';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    api.get('/certificates').then(({ data }) => {
      setCerts(data.data || []);
    }).catch(err => {
      setError(err.response?.data?.message || 'Failed to load certificates.');
    }).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (cert) => {
    if (!cert.pdfUrl) return;
    setDownloadingId(cert._id);
    try {
      const res = await fetch(cert.pdfUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `JOEAILABS_${cert.certId}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch {} finally { setDownloadingId(null); }
  };

  if (loading) return <Spinner text="LOADING CERTIFICATES" />;

  return (
    <div className="container" style={{ padding:'40px 24px 60px' }}>
      <div style={{ marginBottom:32 }}>
        <span className="badge badge-yellow" style={{ marginBottom:12 }}><i className="fas fa-certificate" /> ACHIEVEMENTS</span>
        <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.2rem,3vw,1.8rem)', color:'var(--neon-yellow)', marginBottom:6 }}>
          CERTIFICATE NEXUS
        </h1>
        <p style={{ color:'var(--text-muted)' }}>Complete all lessons in a module to earn a verifiable completion certificate.</p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {certs.length === 0 ? (
        <EmptyState
          emoji="🏅"
          title="NO CERTIFICATES YET"
          description="Complete all lessons in any module to earn your first certificate. Keep learning!"
          action={<Link to="/modules" className="btn btn-primary"><i className="fas fa-graduation-cap" /> START LEARNING</Link>}
        />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {certs.map(cert => (
            <div key={cert._id} className="card" style={{
              display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap',
              borderLeft:'4px solid var(--neon-yellow)',
              background:'linear-gradient(135deg, rgba(255,214,0,0.03), transparent)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{
                  width:56, height:56, borderRadius:'50%', flexShrink:0,
                  background:'rgba(255,214,0,0.1)', border:'2px solid rgba(255,214,0,0.35)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.5rem', boxShadow:'0 0 16px rgba(255,214,0,0.15)',
                }}>🏆</div>
                <div>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:4 }}>{cert.title}</h3>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    <span style={{ color:'var(--text-dim)', fontSize:'0.78rem' }}>
                      <i className="fas fa-hashtag" style={{ marginRight:4 }} />{cert.certId}
                    </span>
                    <span style={{ color:'var(--text-dim)', fontSize:'0.78rem' }}>
                      <i className="fas fa-calendar" style={{ marginRight:4 }} />
                      {new Date(cert.issuedAt).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' })}
                    </span>
                  </div>
                  <div style={{ marginTop:6 }}>
                    <span className="badge badge-yellow"><i className="fas fa-check-circle" /> COMPLETED</span>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                {cert.pdfUrl && (
                  <button onClick={() => handleDownload(cert)} disabled={downloadingId === cert._id}
                    className="btn btn-yellow btn-sm">
                    {downloadingId === cert._id
                      ? <><i className="fas fa-circle-notch fa-spin" /> Downloading...</>
                      : <><i className="fas fa-download" /> Download PDF</>}
                  </button>
                )}
                <Link to={`/modules`} className="btn btn-ghost btn-sm">
                  <i className="fas fa-redo" /> Revisit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
