import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner } from '../../components/ui/index.jsx';

function BarChart({ data = [], labelKey = '_id', valueKey = 'count', height = 200, color = 'var(--neon-green)' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 20 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--neon-green)', fontFamily: 'Orbitron,sans-serif' }}>{d[valueKey]}</span>
          <div style={{
            width: '100%', height: `${(d[valueKey] / max) * 100}%`,
            background: `linear-gradient(to top, ${color}, ${color}44)`,
            borderRadius: '4px 4px 0 0', minHeight: 4,
            transition: 'height 0.3s',
          }} />
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: 4 }}>{d[labelKey]?.slice(5) || d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--neon-green)', lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loading } = useFetch(() => adminAPI.getAnalytics());

  if (loading) return <Spinner text="LOADING ANALYTICS" />;

  const analytics = data?.data || {};
  const overview = analytics.overview || {};

  const revenueData = analytics.revenue || { totalRevenue: 0, count: 0 };
  const dailySignups = analytics.dailySignups || [];
  const topLessons = analytics.topLessons || [];
  const moduleProgress = analytics.moduleProgress || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>ANALYTICS</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Platform metrics and trends.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard label="Total Users" value={overview.totalUsers || 0} />
        <StatCard label="Premium Users" value={overview.premiumUsers || 0} />
        <StatCard label="Revenue" value={`$${(revenueData.totalRevenue || 0).toFixed(2)}`} />
        <StatCard label="Paid Transactions" value={revenueData.count || 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: 16, letterSpacing: 1 }}>
            <i className="fas fa-user-plus" style={{ marginRight: 8 }} />DAILY SIGNUPS (30 DAYS)
          </h3>
          {dailySignups.length > 0 ? (
            <BarChart data={dailySignups} labelKey="_id" valueKey="count" color="var(--neon-blue)" />
          ) : <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No data yet.</p>}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: 16, letterSpacing: 1 }}>
            <i className="fas fa-check-double" style={{ marginRight: 8 }} />TOP LESSONS
          </h3>
          {topLessons.length > 0 ? (
            <div>
              {topLessons.slice(0, 8).map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'Orbitron,sans-serif', width: 20 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: 3 }}>{l.title}</div>
                    <div style={{
                      height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${Math.min((l.count / Math.max(...topLessons.map(x => x.count), 1)) * 100, 100)}%`,
                        background: 'var(--neon-green)', borderRadius: 3,
                      }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--neon-yellow)', fontFamily: 'Orbitron,sans-serif' }}>{l.count}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No completions yet.</p>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: 16, letterSpacing: 1 }}>
          <i className="fas fa-layer-group" style={{ marginRight: 8 }} />MODULE ENGAGEMENT
        </h3>
        {moduleProgress.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)' }}>Module</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)' }}>Lessons</th>
              </tr>
            </thead>
            <tbody>
              {moduleProgress.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-main)' }}>{m.title}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neon-blue)' }}>{m.lessonCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No module data.</p>}
      </div>
    </div>
  );
}
