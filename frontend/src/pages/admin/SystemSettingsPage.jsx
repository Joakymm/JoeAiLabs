import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import { Spinner, Alert } from '../../components/ui/index.jsx';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await adminAPI.getSettings();
      setSettings(data.data || {});
    } catch { setSettings({}); }
    finally { setLoading(false); }
  };

  const update = async (key, value) => {
    setSaving(key);
    try {
      await adminAPI.updateSetting(key, value);
      setSettings(p => ({ ...p, [key]: value }));
      setMsg(`${key} updated.`);
    } catch { setMsg(`Failed to update ${key}.`); }
    finally { setSaving(''); }
  };

  const changeSetting = (key, value) => {
    setSettings(p => ({ ...p, [key]: value }));
  };

  if (loading) return <Spinner text="LOADING SETTINGS" />;

  const maintenanceMode = settings?.maintenanceMode;
  const announcement = settings?.announcement || { text: '', link: '' };
  const paymentMethods = settings?.paymentMethods || { binance: true, mpesa: false, airtel: false };
  const communityLinks = settings?.communityLinks || { whatsapp: '', telegram: '', discord: '' };
  const premiumPricing = settings?.premiumPricing || { monthly: 9.99, lifetime: 29 };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>SYSTEM SETTINGS</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Configure platform-wide settings.</p>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Maintenance Mode */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem', color: 'var(--neon-green)', marginBottom: 14 }}>
            <i className="fas fa-shield" style={{ marginRight: 8 }} />MAINTENANCE MODE
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {maintenanceMode ? 'Site is in maintenance mode. Users will see a maintenance page.' : 'Site is live and accessible to all users.'}
            </span>
            <button onClick={() => update('maintenanceMode', !maintenanceMode)}
              className={`btn ${maintenanceMode ? 'btn-secondary' : 'btn-primary'} btn-sm`}
              disabled={saving === 'maintenanceMode'}>
              {saving === 'maintenanceMode' ? '...' : maintenanceMode ? 'DISABLE' : 'ENABLE'}
            </button>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem', color: 'var(--neon-green)', marginBottom: 14 }}>
            <i className="fas fa-bullhorn" style={{ marginRight: 8 }} />ANNOUNCEMENT BANNER
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label>Banner Text (leave empty to hide)</label>
              <input value={announcement.text} onChange={e => changeSetting('announcement', { ...announcement, text: e.target.value })}
                style={{ width: '100%', marginTop: 4 }} />
            </div>
            <div>
              <label>Link URL (optional)</label>
              <input value={announcement.link} onChange={e => changeSetting('announcement', { ...announcement, link: e.target.value })}
                style={{ width: '100%', marginTop: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => update('announcement', announcement)} className="btn btn-primary btn-sm" disabled={saving === 'announcement'}>
                {saving === 'announcement' ? '...' : 'SAVE BANNER'}
              </button>
            </div>
          </div>
          {announcement.text && (
            <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--neon-blue)' }}>Preview: {announcement.text}</div>
              {announcement.link && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>Link: {announcement.link}</div>}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem', color: 'var(--neon-green)', marginBottom: 14 }}>
            <i className="fas fa-credit-card" style={{ marginRight: 8 }} />PAYMENT METHODS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.keys(paymentMethods).map(method => (
              <div key={method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-main)', textTransform: 'capitalize', fontSize: '0.88rem' }}>{method}</span>
                <button onClick={() => update('paymentMethods', { ...paymentMethods, [method]: !paymentMethods[method] })}
                  className={`btn ${paymentMethods[method] ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  disabled={saving === 'paymentMethods'}>
                  {paymentMethods[method] ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Community URLs */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem', color: 'var(--neon-green)', marginBottom: 14 }}>
            <i className="fas fa-link" style={{ marginRight: 8 }} />COMMUNITY URLS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(communityLinks).map(([key, val]) => (
              <div key={key}>
                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                <input value={val} onChange={e => changeSetting('communityLinks', { ...communityLinks, [key]: e.target.value })}
                  style={{ width: '100%', marginTop: 4 }} placeholder={`https://${key}.com/...`} />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => update('communityLinks', communityLinks)} className="btn btn-primary btn-sm" disabled={saving === 'communityLinks'}>
                {saving === 'communityLinks' ? '...' : 'SAVE URLS'}
              </button>
            </div>
          </div>
        </div>

        {/* Premium Pricing */}
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem', color: 'var(--neon-green)', marginBottom: 14 }}>
            <i className="fas fa-dollar-sign" style={{ marginRight: 8 }} />PREMIUM PRICING
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label>Monthly Price ($)</label>
              <input type="number" step="0.01" value={premiumPricing.monthly}
                onChange={e => changeSetting('premiumPricing', { ...premiumPricing, monthly: Number(e.target.value) })}
                style={{ width: '100%', marginTop: 4 }} />
            </div>
            <div>
              <label>Lifetime Price ($)</label>
              <input type="number" step="0.01" value={premiumPricing.lifetime}
                onChange={e => changeSetting('premiumPricing', { ...premiumPricing, lifetime: Number(e.target.value) })}
                style={{ width: '100%', marginTop: 4 }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button onClick={() => update('premiumPricing', premiumPricing)} className="btn btn-primary btn-sm" disabled={saving === 'premiumPricing'}>
              {saving === 'premiumPricing' ? '...' : 'SAVE PRICING'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
