import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Alert } from '../../components/ui/index.jsx';

const PRESET_AVATARS = [
  { name: 'Cyber Hacker', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Synth Wave', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'AI Core', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Tech Blade', url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Cyber Rogue', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Neural Net', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Grid Rider', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&h=150&q=80' },
  { name: 'Quantum Dev', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&h=150&q=80' },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle reputation milestones
  const getReputationLevel = (score = 0) => {
    if (score < 100) return { title: 'SCRIPT KIDDIE', min: 0, max: 100, color: 'var(--neon-blue)' };
    if (score < 300) return { title: 'CYBER RUNNER', min: 100, max: 300, color: 'var(--neon-yellow)' };
    return { title: 'NEURAL OVERLORD', min: 300, max: 9999, color: 'var(--neon-green)' };
  };

  const currentLevel = getReputationLevel(user?.reputationScore);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data } = await authAPI.update({
        fullName,
        bio,
        avatar
      });

      if (data.success) {
        setSuccessMsg('Profile database records updated successfully.');
        await refreshUser();
      } else {
        setErrorMsg('Failed to update profile records.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile database.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      {/* Settings Header */}
      <div style={{ marginBottom: 32 }}>
        <span className="badge badge-green" style={{ marginBottom: 12 }}>SYSTEM SETTINGS</span>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 8 }}>
          USER PROFILE TERMINAL
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage credentials, customize interface parameters, and track subscription vectors.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'flex-start' }}>
        {/* Navigation Sidebar */}
        <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'profile', icon: 'fa-user-gear', label: 'PROFILE DETAILS' },
            { id: 'security', icon: 'fa-shield-halved', label: 'SECURITY & TECH' },
            { id: 'billing', icon: 'fa-credit-card', label: 'BILLING & PLAN' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setErrorMsg(''); setSuccessMsg(''); }}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                justifyContent: 'flex-start',
                padding: '12px 16px',
                fontSize: '0.82rem',
                fontFamily: 'Orbitron,sans-serif',
                letterSpacing: 1.5,
                border: 'none',
                background: activeTab === tab.id ? 'var(--neon-green)' : 'transparent',
                color: activeTab === tab.id ? '#020508' : 'var(--text-muted)'
              }}
            >
              <i className={`fas ${tab.icon}`} style={{ marginRight: 12, width: 16 }} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        <div>
          {errorMsg && <Alert type="error" onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}
          {successMsg && <Alert type="success" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.05rem', color: 'var(--neon-green)', marginBottom: 24, letterSpacing: 1 }}>
                CUSTOMIZE USER BIO-DETAILS
              </h3>

              <form onSubmit={handleSaveProfile}>
                {/* Custom Cyberpunk Avatar Picker */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: 12, letterSpacing: 1 }}>
                    NEURAL PRESENCE AVATAR
                  </label>
                  
                  {/* Selected avatar preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      overflow: 'hidden', border: '2px solid var(--neon-green)',
                      boxShadow: '0 0 15px rgba(0,255,163,0.2)',
                      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {avatar ? (
                        <img src={avatar} alt="Current avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fas fa-user-astronaut" style={{ fontSize: '2rem', color: 'var(--neon-green)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Avatar Preset Matrix</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose an encrypted neural avatar preset or enter custom image URL below.</div>
                    </div>
                  </div>

                  {/* Grid of options */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: 10,
                    padding: 16, borderRadius: 10, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    {PRESET_AVATARS.map(av => {
                      const isSelected = avatar === av.url;
                      return (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => setAvatar(av.url)}
                          title={av.name}
                          style={{
                            width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', padding: 0,
                            border: `2px solid ${isSelected ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)'}`,
                            cursor: 'pointer', outline: 'none', transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 0 12px var(--neon-green)' : 'none',
                            transform: isSelected ? 'scale(1.08)' : 'none',
                            margin: '0 auto'
                          }}
                        >
                          <img src={av.url} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom avatar input */}
                  <div style={{ marginTop: 14 }}>
                    <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.7rem', marginBottom: 6 }}>
                      OR DIRECT CUSTOM AVATAR IMAGE URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={avatar}
                      onChange={e => setAvatar(e.target.value)}
                      style={{ fontSize: '0.85rem', width: '100%', padding: '10px 14px' }}
                    />
                  </div>
                </div>

                {/* Full name input */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: 8, letterSpacing: 1 }}>
                    FULL LEGAL NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name..."
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px' }}
                  />
                </div>

                {/* Bio text area */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ color: 'var(--text-dim)', fontSize: '0.78rem', letterSpacing: 1 }}>
                      USER SYSTEM BIOGRAPHY
                    </label>
                    <span style={{ fontSize: '0.75rem', color: bio.length > 450 ? 'var(--neon-red)' : 'var(--text-dim)' }}>
                      {500 - bio.length} chars left
                    </span>
                  </div>
                  <textarea
                    placeholder="Write standard bio..."
                    maxLength={500}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 8,
                      background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff', outline: 'none', resize: 'none', fontSize: '0.9rem', lineHeight: 1.5
                    }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={updating}>
                  {updating ? (
                    <><i className="fas fa-circle-notch fa-spin" /> SYNCHRONIZING...</>
                  ) : (
                    <><i className="fas fa-save" /> UPDATE NODE MODULE</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security & Credentials Tab */}
          {activeTab === 'security' && (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.05rem', color: 'var(--neon-yellow)', marginBottom: 24, letterSpacing: 1 }}>
                ENCRYPTED CREDENTIAL REGISTERS
              </h3>

              {/* Readonly info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'Orbitron,sans-serif' }}>IDENTIFIER</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{user?.username}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'Orbitron,sans-serif' }}>IDENTITY EMAIL</div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{user?.email}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'Orbitron,sans-serif' }}>SECURITY ROLE</div>
                  <div style={{ color: 'var(--neon-blue)', fontSize: '0.85rem', fontFamily: 'Orbitron,sans-serif', fontWeight: 700 }}>
                    {user?.role?.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'Orbitron,sans-serif' }}>REGISTERED DATE</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(user?.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Reputation milestone info */}
              <div className="card" style={{ borderColor: currentLevel.color + '30', background: currentLevel.color + '02' }}>
                <h4 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: currentLevel.color, marginBottom: 12, letterSpacing: 1.5 }}>
                  REPUTATION MILESTONE VECTORS
                </h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{currentLevel.title}</div>
                  <div style={{ fontFamily: 'Orbitron,sans-serif', color: currentLevel.color, fontWeight: 700 }}>
                    {user?.reputationScore} REP
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    width: `${Math.min(((user?.reputationScore || 0) / currentLevel.max) * 100, 100)}%`,
                    background: currentLevel.color, height: '100%'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>{currentLevel.min} REP</span>
                  <span>{currentLevel.max} REP</span>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Subscriptions */}
          {activeTab === 'billing' && (
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.05rem', color: 'var(--neon-blue)', marginBottom: 24, letterSpacing: 1 }}>
                SYSTEM SUBSCRIBER VECTOR
              </h3>

              <div className="card" style={{
                borderLeft: `4px solid ${user?.isPremium ? 'var(--neon-yellow)' : 'var(--text-muted)'}`,
                padding: '24px', marginBottom: 24, background: 'rgba(0,0,0,0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: 1 }}>
                    SUBSCRIBED SECTOR STATUS
                  </span>
                  <span className={`badge ${user?.isPremium ? 'badge-yellow' : 'badge-muted'}`}>
                    {user?.isPremium ? 'PRO MEMBER' : 'FREE TIER'}
                  </span>
                </div>

                {user?.isPremium ? (
                  <div>
                    <h4 style={{ color: 'var(--neon-yellow)', fontFamily: 'Orbitron,sans-serif', fontSize: '1.1rem', marginBottom: 8 }}>
                      LIFETIME ACCESS GRANTED
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      All systems green. You have secured permanent access keys for all modules, prompt templates, and AI integrations.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: 8 }}>
                      LIMITED ACCESS KEY
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                      Upgrading to PRO secures complete access to all 13+ modules, 226+ prompt templates, AI tutor endpoints, and a permanent PRO badge.
                    </p>
                    <Link to="/upgrade" className="btn btn-yellow btn-sm">
                      <i className="fas fa-star" /> UNLOCK PRO UPGRADE
                    </Link>
                  </div>
                )}
              </div>

              {/* Regional Mobile money payments status */}
              {!user?.isPremium && (
                <div className="card">
                  <h4 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    REGIONAL PAYMENTS VECTOR
                  </h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                    Need local checkout endpoints like M-Pesa or Airtel Money? Tap below to enroll in regional payment launch queues.
                  </p>
                  <Link to="/upgrade" style={{ color: 'var(--neon-blue)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, textDecoration: 'none', fontWeight: 600 }}>
                    Enroll in regional payment queue <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
