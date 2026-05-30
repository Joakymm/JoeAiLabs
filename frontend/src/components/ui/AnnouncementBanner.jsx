import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedBanner = localStorage.getItem('joeailabs_dismissed_banner');
    if (dismissedBanner) {
      setDismissed(true);
      return;
    }
    const fetchAnnouncement = async () => {
      try {
        const { data } = await api.get('/settings/public');
        const ann = data?.data?.announcement;
        if (ann && ann.text && ann.isActive !== false) {
          setAnnouncement(ann);
        }
      } catch {}
    };
    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('joeailabs_dismissed_banner', 'true');
  };

  if (dismissed || !announcement) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(0,212,255,0.12), rgba(0,255,163,0.08))',
      borderBottom: '1px solid rgba(0,212,255,0.2)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      position: 'relative',
      zIndex: 100,
    }}>
      <i className="fas fa-bullhorn" style={{ color: 'var(--neon-blue)', fontSize: '0.85rem' }} />
      <span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
        {announcement.link ? (
          <a href={announcement.link} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--neon-blue)', textDecoration: 'underline' }}>
            {announcement.text}
          </a>
        ) : announcement.text}
      </span>
      <button onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', color: 'var(--text-dim)',
          cursor: 'pointer', padding: '4px 8px', fontSize: '0.85rem',
          position: 'absolute', right: 16,
        }}>
        <i className="fas fa-times" />
      </button>
    </div>
  );
}
