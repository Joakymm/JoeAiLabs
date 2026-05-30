import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../services/api';
import api from '../services/api';
import { Alert, Spinner } from '../components/ui/index.jsx';

function PaymentModal({ plan, onClose, onPaid }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');
  const [copied, setCopied] = useState(false);

  const createOrder = useCallback(async () => {
    try {
      const { data } = await paymentsAPI.createOrder(plan.id);
      setOrder(data.data);
      setStatus(data.data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment order.');
    } finally {
      setLoading(false);
    }
  }, [plan.id]);

  useEffect(() => { createOrder(); }, [createOrder]);

  useEffect(() => {
    if (!order?.orderId || status === 'paid') return;
    const interval = setInterval(async () => {
      try {
        const { data } = await paymentsAPI.getStatus(order.orderId);
        if (data.data.status === 'paid') {
          setStatus('paid');
          clearInterval(interval);
          setTimeout(() => onPaid?.(), 1500);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [order?.orderId, status, navigate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.checkoutUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1rem', color: 'var(--neon-green)' }}>
            COMPLETE PAYMENT
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {loading && <Spinner text="CREATING ORDER..." />}

        {error && <Alert type="error">{error}</Alert>}

        {!loading && !error && order && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '2.5rem', color: plan.color, marginBottom: 4 }}>
                ${plan.price}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{plan.label} PLAN</div>
            </div>

            {order.qrContent && (
              <div style={{
                width: 200, height: 200, margin: '0 auto 20px',
                background: '#fff', borderRadius: 12, padding: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(order.qrContent)}`}
                  alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            {order.checkoutUrl ? (
              <div style={{ marginBottom: 16 }}>
                <a href={order.checkoutUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary btn-full" style={{ marginBottom: 8 }}>
                  <i className="fas fa-external-link-alt" /> PAY WITH BINANCE
                </a>
                <button onClick={handleCopy} className="btn btn-ghost btn-full btn-sm">
                  <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} />
                  {copied ? 'COPIED!' : 'COPY CHECKOUT LINK'}
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                Checkout link unavailable. Please try again or contact support.
              </div>
            )}

            {status === 'paid' ? (
              <div style={{ padding: 20, background: 'rgba(0,255,163,0.08)', borderRadius: 12, border: '1px solid rgba(0,255,163,0.25)' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: 'var(--neon-green)', marginBottom: 8 }} />
                <p style={{ color: 'var(--neon-green)', fontWeight: 700 }}>PAYMENT CONFIRMED! Redirecting...</p>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 6 }} />
                Waiting for payment confirmation...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [settings, setSettings] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState({ mpesa: '', airtel: '' });
  const [notifyMsg, setNotifyMsg] = useState({ mpesa: '', airtel: '' });
  const [notifyLoading, setNotifyLoading] = useState({ mpesa: false, airtel: false });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/public');
        setSettings(data.data || {});
      } catch {}
    };
    fetchSettings();
  }, []);

  const pricing = settings?.premiumPricing || { monthly: 9.99, lifetime: 29 };
  const paymentMethods = settings?.paymentMethods || { binance: true, mpesa: false, airtel: false };

  const PLANS = [
    {
      id: 'monthly',
      price: pricing.monthly?.toString() || '9.99',
      label: 'MONTHLY',
      sub: `$${pricing.monthly || '9.99'} / month`,
      features: [
        'All 13+ AI learning modules',
        '226+ prompt templates',
        'AI tutor access',
        'Cancel anytime',
      ],
      color: 'var(--neon-green)',
    },
    {
      id: 'lifetime',
      price: pricing.lifetime?.toString() || '29',
      label: 'LIFETIME',
      sub: `$${pricing.lifetime || '29'} one-time`,
      features: [
        'Everything in Monthly',
        'All future modules free',
        'Priority support',
        'Lifetime PRO badge',
      ],
      color: 'var(--neon-yellow)',
      popular: true,
    },
  ];

  if (user?.isPremium) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>⭐</div>
        <h2 style={{ fontFamily: 'Orbitron,sans-serif', color: 'var(--neon-yellow)', marginBottom: 12 }}>YOU'RE ALREADY PRO</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>You have full access to all premium content.</p>
        <a href="/dashboard" className="btn btn-primary">GO TO DASHBOARD</a>
      </div>
    );
  }

  const handlePaid = async () => {
    await refreshUser();
    setSelectedPlan(null);
    navigate('/dashboard');
  };

  const handleWaitlist = async (source) => {
    const email = notifyEmail[source];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotifyMsg(prev => ({ ...prev, [source]: 'Please enter a valid email.' }));
      return;
    }
    setNotifyLoading(prev => ({ ...prev, [source]: true }));
    try {
      const { data } = await paymentsAPI.joinWaitlist(email, source);
      setNotifyMsg(prev => ({ ...prev, [source]: data.message }));
      setNotifyEmail(prev => ({ ...prev, [source]: '' }));
    } catch (err) {
      setNotifyMsg(prev => ({ ...prev, [source]: err.response?.data?.message || 'Error joining waitlist.' }));
    } finally {
      setNotifyLoading(prev => ({ ...prev, [source]: false }));
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span className="badge badge-yellow" style={{ marginBottom: 16 }}>UPGRADE</span>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: 12 }}>
          UNLOCK <span style={{ color: 'var(--neon-yellow)' }}>PREMIUM</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
           Get full access to all 13+ modules, 226+ prompt templates, and the AI tutor.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 700, margin: '0 auto 48px' }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{
            textAlign: 'center', padding: '36px 28px',
            borderTop: `2px solid ${plan.color}`,
            position: 'relative',
            transform: plan.popular ? 'scale(1.05)' : 'none',
            zIndex: plan.popular ? 1 : 0,
          }}>
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--neon-yellow)', color: '#020508',
                padding: '4px 16px', borderRadius: 100,
                fontFamily: 'Orbitron,sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: 2,
              }}>
                BEST VALUE
              </div>
            )}
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.8rem', color: plan.color, letterSpacing: 2, marginBottom: 8 }}>
              {plan.label}
            </div>
            <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '3rem', fontWeight: 900, color: plan.color, marginBottom: 4 }}>
              ${plan.price}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>{plan.sub}</div>
            <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 28 }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  <i className="fas fa-check-circle" style={{ color: plan.color, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            {paymentMethods.binance ? (
              <button onClick={() => setSelectedPlan(plan)}
                className={`btn ${plan.popular ? 'btn-yellow' : 'btn-primary'}`} style={{ width: '100%' }}>
                {plan.popular ? <><i className="fas fa-star" /> GET LIFETIME</> : <><i className="fas fa-rocket" /> SUBSCRIBE</>}
              </button>
            ) : (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', padding: 12 }}>
                Binance Pay is currently disabled.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Money */}
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className="badge badge-muted">MOBILE MONEY</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { id: 'mpesa', label: 'M-PESA', icon: 'fa-mobile-screen', desc: 'Pay with M-Pesa from Kenya, Tanzania, and more.', enabled: paymentMethods.mpesa },
            { id: 'airtel', label: 'AIRTEL MONEY', icon: 'fa-money-bill-wave', desc: 'Pay with Airtel Money across Africa.', enabled: paymentMethods.airtel },
          ].map(method => (
            <div key={method.id} className="card" style={{ textAlign: 'center', opacity: method.enabled ? 1 : 0.5 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12, color: 'var(--text-dim)' }}>
                <i className={`fas ${method.icon}`} />
              </div>
              <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 2 }}>
                {method.label}
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: 16 }}>{method.desc}</p>
              {method.enabled ? (
                <p style={{ color: 'var(--neon-green)', fontSize: '0.82rem' }}>
                  <i className="fas fa-check-circle" /> Available
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail[method.id]}
                    onChange={e => setNotifyEmail(prev => ({ ...prev, [method.id]: e.target.value }))}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                  />
                  <button
                    onClick={() => handleWaitlist(method.id)}
                    disabled={notifyLoading[method.id]}
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    {notifyLoading[method.id] ? <i className="fas fa-circle-notch fa-spin" /> : 'NOTIFY ME'}
                  </button>
                </div>
              )}
              {notifyMsg[method.id] && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--neon-green)' }}>{notifyMsg[method.id]}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}
