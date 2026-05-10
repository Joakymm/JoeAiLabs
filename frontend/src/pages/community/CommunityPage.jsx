import { useState } from 'react';
import { paymentsAPI } from '../../services/api';
import { Alert } from '../../components/ui/index.jsx';

const COMMUNITY_LINKS = {
  whatsapp: 'https://chat.whatsapp.com/joinjoeailabs',
  telegram: 'https://t.me/joeailabs',
};

function addUtm(url, source) {
  const params = `utm_source=${source}&utm_medium=community&utm_campaign=joeailabs_community`;
  return `${url}${url.includes('?') ? '&' : '?'}${params}`;
}

const PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'fa-brands fa-whatsapp',
    color: '#25D366',
    members: '340+',
    online: '12',
    desc: 'Join our WhatsApp community for daily AI tips, prompt sharing, and networking with fellow learners.',
    inviteUrl: addUtm(COMMUNITY_LINKS.whatsapp, 'whatsapp'),
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'fa-brands fa-telegram',
    color: '#0088cc',
    members: '180+',
    online: '8',
    desc: 'Get real-time updates, exclusive prompt templates, and direct access to the JOEAILABS team.',
    inviteUrl: addUtm(COMMUNITY_LINKS.telegram, 'telegram'),
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'fa-brands fa-discord',
    color: '#5865F2',
    members: 'Coming Soon',
    online: '—',
    desc: 'Our Discord server will feature dedicated channels for each module, live Q&A, and community challenges.',
    inviteUrl: null,
  },
];

export default function CommunityPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDiscordWaitlist = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await paymentsAPI.joinWaitlist(email, 'discord');
      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <span className="badge badge-green" style={{ marginBottom: 12 }}>COMMUNITY</span>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 8 }}>
            CONNECT WITH <span style={{ color: 'var(--neon-green)' }}>FELLOW LEARNERS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500 }}>
            Join thousands of AI enthusiasts sharing prompts, tips, and victories. Your next breakthrough is one conversation away.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
          {PLATFORMS.map(p => (
            <div key={p.id} className="card" style={{
              textAlign: 'center', padding: '32px 24px',
              borderTop: `2px solid ${p.color}44`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `${p.color}15`, border: `2px solid ${p.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: p.color, marginBottom: 16,
              }}>
                <i className={p.icon} />
              </div>

              <h2 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.1rem', color: p.color, marginBottom: 4, letterSpacing: 2 }}>
                {p.name}
              </h2>

              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)' }}>{p.members}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>Members</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)' }}>{p.online}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>Online</div>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 20 }}>
                {p.desc}
              </p>

              {p.inviteUrl ? (
                <a href={p.inviteUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm" style={{ width: '100%', borderColor: `${p.color}44`, color: p.color }}>
                  <i className={p.icon} /> JOIN {p.name.toUpperCase()}
                </a>
              ) : (
                <div style={{ width: '100%' }}>
                  <form onSubmit={handleDiscordWaitlist}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                        disabled={loading}
                      />
                      <button type="submit" disabled={loading}
                        className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                        {loading ? <i className="fas fa-circle-notch fa-spin" /> : 'NOTIFY ME'}
                      </button>
                    </div>
                    {message && <Alert type="success">{message}</Alert>}
                    {error && <Alert type="error">{error}</Alert>}
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 600, margin: '0 auto', borderColor: 'rgba(0,255,163,0.15)', background: 'rgba(0,255,163,0.02)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤝</div>
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', color: 'var(--neon-green)', marginBottom: 8, fontSize: '1rem' }}>
            COMMUNITY GUIDELINES
          </h3>
          <ul style={{ listStyle: 'none', textAlign: 'left', maxWidth: 400, margin: '0 auto' }}>
            {[
              'Be respectful and supportive — everyone starts somewhere',
              'Share prompts, wins, and lessons learned',
              'No spam or self-promotion without value',
              'Help others — teaching is the best way to learn',
            ].map((rule, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--neon-green)' }}>⚡</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
