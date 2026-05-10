import { useState } from 'react';
import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, Alert, EmptyState } from '../../components/ui/index.jsx';

const STATUS_COLORS = {
  paid: 'var(--neon-green)',
  pending: 'var(--neon-yellow)',
  expired: 'var(--neon-red)',
  cancelled: 'var(--text-dim)',
};

export default function PaymentRecords() {
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useFetch(() => adminAPI.getPayments({ page, limit: 50 }));
  const [msg, setMsg] = useState('');

  const payments = data?.data || [];
  const meta = data?.meta || { total: 0, pages: 1 };

  const exportCSV = () => {
    const headers = 'Order ID,User,Email,Amount,Currency,Status,Plan,Date,Binance TX ID\n';
    const rows = payments.map(p =>
      `"${p.orderId}","${p.userId?.username || 'N/A'}","${p.userId?.email || 'N/A'}","${p.amount}","${p.currency}","${p.status}","${p.planType}","${new Date(p.createdAt).toLocaleDateString()}","${p.binanceTransactionId || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Spinner text="LOADING PAYMENTS" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>PAYMENT RECORDS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{meta.total} total transactions.</p>
        </div>
        <button onClick={exportCSV} className="btn btn-ghost btn-sm"><i className="fas fa-download" /> EXPORT CSV</button>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      {payments.length === 0 ? (
        <EmptyState emoji="💳" title="No Payments Yet" description="Payments will appear here when users purchase premium." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>User</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Plan</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Binance TX</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.78rem' }}>{p.orderId?.slice(0, 16)}...</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{p.userId?.username || 'N/A'}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{p.userId?.email || ''}</div>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--neon-green)', fontFamily: 'Orbitron,sans-serif', fontWeight: 700 }}>
                    {p.amount} {p.currency}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 12px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                      color: STATUS_COLORS[p.status] || 'var(--text-dim)',
                      background: `${STATUS_COLORS[p.status] || 'var(--text-dim)'}15`,
                    }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p.planType}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'Share Tech Mono, monospace' }}>
                    {p.binanceTransactionId ? `${p.binanceTransactionId.slice(0, 12)}...` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: meta.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)',
                background: page === i + 1 ? 'rgba(0,255,163,0.15)' : 'transparent',
                color: page === i + 1 ? 'var(--neon-green)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'Orbitron,sans-serif', fontSize: '0.8rem',
              }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
