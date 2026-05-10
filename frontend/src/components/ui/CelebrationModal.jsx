import { useEffect } from 'react';

const COMMUNITY_LINKS = {
  whatsapp: 'https://chat.whatsapp.com/joinjoeailabs?utm_source=celebration&utm_medium=modal&utm_campaign=joeailabs_community',
  telegram: 'https://t.me/joeailabs?utm_source=celebration&utm_medium=modal&utm_campaign=joeailabs_community',
};

export default function CelebrationModal({ onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480, textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 8 }}>
          FIRST LESSON COMPLETE!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.7 }}>
          Awesome work starting your AI journey! 🚀<br />
          Join our community to celebrate, share what you learned, and connect with fellow AI builders.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <a href={COMMUNITY_LINKS.whatsapp} target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary btn-full" style={{ borderColor: '#25D36644', color: '#25D366' }}>
            <i className="fa-brands fa-whatsapp" /> JOIN WHATSAPP
          </a>
          <a href={COMMUNITY_LINKS.telegram} target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary btn-full" style={{ borderColor: '#0088cc44', color: '#0088cc' }}>
            <i className="fa-brands fa-telegram" /> JOIN TELEGRAM
          </a>
        </div>

        <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
          <i className="fas fa-arrow-right" /> CONTINUE LEARNING
        </button>
      </div>
    </div>
  );
}
