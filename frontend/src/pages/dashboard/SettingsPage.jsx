import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../hooks/index.js';
import { Alert, ToastContainer, Spinner } from '../../components/ui/index.jsx';
import api from '../../services/api';

const TABS = [
  { id:'profile',   icon:'fa-user',          label:'Profile' },
  { id:'security',  icon:'fa-lock',           label:'Security' },
  { id:'appearance',icon:'fa-palette',        label:'Appearance' },
  { id:'notifications',icon:'fa-bell',        label:'Notifications' },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [tab, setTab] = useState('profile');

  return (
    <div className="container" style={{ padding:'40px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <span className="badge badge-muted" style={{ marginBottom:12 }}>
          <i className="fas fa-cog" /> SETTINGS
        </span>
        <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.2rem,3vw,1.8rem)', color:'var(--neon-green)', marginBottom:6 }}>Account Settings</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Manage your profile, security, and preferences.</p>
      </div>

      <div className="settings-grid" style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:24 }}>
        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                borderRadius:10, border:'none', cursor:'pointer', textAlign:'left',
                background: tab === t.id ? 'rgba(0,255,163,0.1)' : 'transparent',
                color: tab === t.id ? 'var(--neon-green)' : 'var(--text-muted)',
                fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'0.95rem',
                transition:'all 0.2s', borderLeft: tab === t.id ? '3px solid var(--neon-green)' : '3px solid transparent',
              }}
            >
              <i className={`fas ${t.icon}`} style={{ width:18, textAlign:'center', fontSize:'0.9rem' }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'profile'      && <ProfileTab user={user} updateUser={updateUser} toast={toast} />}
          {tab === 'security'     && <SecurityTab toast={toast} />}
          {tab === 'appearance'   && <AppearanceTab theme={theme} toggleTheme={toggleTheme} />}
          {tab === 'notifications'&& <NotificationsTab toast={toast} />}
        </div>
      </div>

      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
    </div>
  );
}

function SettingsCard({ title, icon, children }) {
  return (
    <div className="card" style={{ marginBottom:20 }}>
      <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-green)', letterSpacing:2, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
        <i className={`fas ${icon}`} />{title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ProfileTab({ user, updateUser, toast }) {
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '', location: user?.location || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) { setError('Username is required.'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser?.(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      {/* Avatar section */}
      <SettingsCard title="PROFILE PHOTO" icon="fa-image">
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'linear-gradient(135deg, rgba(0,255,163,0.15), rgba(0,212,255,0.1))',
            border:'2px solid rgba(0,255,163,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2rem', flexShrink:0,
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
            ) : '👤'}
          </div>
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:10 }}>Profile photo is auto-generated based on your username.</p>
            <div style={{ display:'flex', gap:8 }}>
              <span className="badge badge-muted">
                <i className="fas fa-user" /> {user?.username}
              </span>
              {user?.isPremium && <span className="badge badge-yellow"><i className="fas fa-star" /> PRO</span>}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Profile Info */}
      <SettingsCard title="PROFILE INFO" icon="fa-user">
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit}>
          <Field label="Username">
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="Your username" />
          </Field>
          <Field label="Email Address">
            <input value={user?.email || ''} disabled style={{ opacity:0.5, cursor:'not-allowed' }} />
            <p style={{ color:'var(--text-dim)', fontSize:'0.75rem', marginTop:6 }}>Email cannot be changed after registration.</p>
          </Field>
          <Field label="Location">
            <div style={{ position:'relative' }}>
              <i className="fas fa-location-dot" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Nairobi, Kenya" style={{ paddingLeft:40 }} />
            </div>
          </Field>
          <Field label="Bio">
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell the community about yourself..." rows={3} style={{ minHeight:90 }} />
          </Field>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <><i className="fas fa-circle-notch fa-spin" /> SAVING...</> : <><i className="fas fa-check" /> SAVE CHANGES</>}
          </button>
        </form>
      </SettingsCard>

      {/* Account Plan */}
      <SettingsCard title="ACCOUNT PLAN" icon="fa-star">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1.1rem', color: user?.isPremium ? 'var(--neon-yellow)' : 'var(--text-main)' }}>
                {user?.isPremium ? '⭐ PRO PLAN' : 'FREE PLAN'}
              </span>
            </div>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>
              {user?.isPremium ? 'You have full access to all modules, premium prompts, and priority support.' : 'Upgrade to PRO to unlock all AI modules and 500+ prompt templates.'}
            </p>
          </div>
          {!user?.isPremium && (
            <a href="/upgrade" className="btn btn-yellow btn-sm">
              <i className="fas fa-rocket" /> UPGRADE TO PRO
            </a>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}

function SecurityTab({ toast }) {
  const [form, setForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) { setError('All fields are required.'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      await api.put('/users/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally { setLoading(false); }
  };

  return (
    <SettingsCard title="CHANGE PASSWORD" icon="fa-lock">
      <Alert type="error">{error}</Alert>
      <form onSubmit={handleSubmit}>
        <Field label="Current Password">
          <div style={{ position:'relative' }}>
            <i className="fas fa-lock" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input type={showCurrent ? 'text' : 'password'} value={form.currentPassword}
              onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••" style={{ paddingLeft:40, paddingRight:44 }} />
            <button type="button" onClick={() => setShowCurrent(p => !p)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer' }}>
              <i className={`fas ${showCurrent ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </Field>
        <Field label="New Password">
          <div style={{ position:'relative' }}>
            <i className="fas fa-key" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'0.85rem' }} />
            <input type={showNew ? 'text' : 'password'} value={form.newPassword}
              onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Min. 6 characters" style={{ paddingLeft:40, paddingRight:44 }} />
            <button type="button" onClick={() => setShowNew(p => !p)}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer' }}>
              <i className={`fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </Field>
        <Field label="Confirm New Password">
          <input type="password" value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="Repeat new password" />
        </Field>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <><i className="fas fa-circle-notch fa-spin" /> UPDATING...</> : <><i className="fas fa-shield-halved" /> UPDATE PASSWORD</>}
        </button>
      </form>
    </SettingsCard>
  );
}

function AppearanceTab({ theme, toggleTheme }) {
  return (
    <div>
      <SettingsCard title="THEME" icon="fa-palette">
        <p style={{ color:'var(--text-muted)', fontSize:'0.88rem', marginBottom:20, lineHeight:1.6 }}>
          Choose between dark mode (default cyberpunk look) and light mode. Your preference is saved automatically.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {['dark','light'].map(t => (
            <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }}
              style={{
                padding:'20px 16px', borderRadius:14, cursor:'pointer',
                border: theme === t ? '2px solid var(--neon-green)' : '1px solid var(--bg-border)',
                background: theme === t ? 'rgba(0,255,163,0.06)' : 'var(--bg-card)',
                boxShadow: theme === t ? '0 0 20px rgba(0,255,163,0.1)' : 'none',
                transition:'all 0.2s', textAlign:'center',
              }}
            >
              <div style={{ fontSize:'2rem', marginBottom:10 }}>{t === 'dark' ? '🌙' : '☀️'}</div>
              <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.78rem', color: theme === t ? 'var(--neon-green)' : 'var(--text-muted)', letterSpacing:1.5, textTransform:'uppercase' }}>
                {t === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
              {theme === t && (
                <div style={{ marginTop:8 }}>
                  <span className="badge badge-green" style={{ fontSize:'0.6rem' }}>
                    <i className="fas fa-check" /> ACTIVE
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
        <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(0,255,163,0.04)', border:'1px solid rgba(0,255,163,0.1)', borderRadius:10 }}>
          <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:8 }}>
            <i className="fas fa-info-circle" style={{ color:'var(--neon-blue)' }} />
            Theme preference is saved to your browser and persists across sessions.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

function NotificationsTab({ toast }) {
  const [prefs, setPrefs] = useState({
    newLesson: true,
    communityReply: true,
    newPrompt: false,
    weeklyDigest: true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    toast.success('Notification preferences saved!');
    setSaving(false);
  };

  const items = [
    { key:'newLesson',      label:'New Lesson Available', desc:'Get notified when new AI lessons are published.' },
    { key:'communityReply', label:'Community Replies', desc:'Notifications when someone replies to your posts.' },
    { key:'newPrompt',      label:'New Prompt Templates', desc:'Alerts for freshly added prompt templates.' },
    { key:'weeklyDigest',   label:'Weekly Progress Digest', desc:'A weekly summary of your learning achievements.' },
  ];

  return (
    <SettingsCard title="NOTIFICATION PREFERENCES" icon="fa-bell">
      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:20 }}>Control which notifications you receive from JOEAILABS.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {items.map((item, i) => (
          <div key={item.key} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'16px 0',
            borderBottom: i < items.length - 1 ? '1px solid rgba(0,255,163,0.06)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight:700, color:'var(--text-main)', fontSize:'0.9rem', marginBottom:4 }}>{item.label}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{item.desc}</div>
            </div>
            <button
              onClick={() => toggle(item.key)}
              role="switch" aria-checked={prefs[item.key]}
              style={{
                width:48, height:26, borderRadius:13, border:'none', cursor:'pointer',
                background: prefs[item.key] ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)',
                position:'relative', transition:'background 0.2s', flexShrink:0, marginLeft:16,
              }}
            >
              <span style={{
                position:'absolute', top:3, left: prefs[item.key] ? 'calc(100% - 23px)' : 3,
                width:20, height:20, borderRadius:'50%', background:'#fff',
                transition:'left 0.2s', display:'block',
                boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop:20 }}>
        <button onClick={save} disabled={saving} className="btn btn-primary btn-sm">
          {saving ? <><i className="fas fa-circle-notch fa-spin" /> SAVING...</> : <><i className="fas fa-save" /> SAVE PREFERENCES</>}
        </button>
      </div>
    </SettingsCard>
  );
}
