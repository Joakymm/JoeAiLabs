import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, StatCard } from '../../components/ui/index.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data, loading } = useFetch(() => adminAPI.getAnalytics());

  if (loading) return <Spinner text="LOADING ADMIN DASHBOARD" />;

  const { overview, revenue, dailySignups } = data || { overview: {}, revenue: {}, dailySignups: [] };

  return (
    <div>
      <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 6 }}>ADMIN DASHBOARD</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 28 }}>Platform overview at a glance.</p>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="fa-user"       label="Total Users"     value={overview.totalUsers || 0}    color="green" />
        <StatCard icon="fa-star"       label="Premium Users"   value={overview.premiumUsers || 0}  color="yellow" />
        <StatCard icon="fa-user-plus"  label="New (30 days)"   value={overview.newSignups || 0}    color="blue" />
        <StatCard icon="fa-dollar-sign" label="Revenue"        value={`$${(revenue.totalRevenue || 0).toFixed(2)}`} color="green" />
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="fa-book"        label="Modules"        value={overview.totalModules || 0}    color="green" />
        <StatCard icon="fa-file-lines"  label="Lessons"        value={overview.totalLessons || 0}    color="blue" />
        <StatCard icon="fa-bolt"        label="Prompts"        value={overview.totalPrompts || 0}    color="yellow" />
        <StatCard icon="fa-check-double" label="Completions"   value={overview.completedLessons || 0} color="green" />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: 16, letterSpacing: 1 }}>
          <i className="fas fa-trophy" style={{ marginRight: 8 }} />TOP PROMPTS
        </h3>
        {data?.topPrompts?.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)' }}>Prompt</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)' }}>Copies</th>
              </tr>
            </thead>
            <tbody>
              {data.topPrompts.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-main)' }}>{p.title}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neon-yellow)', fontFamily: 'Orbitron,sans-serif' }}>{p.copyCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--text-dim)' }}>No prompt data yet.</p>}
      </div>

      {/* Daily Sign‑ups Line Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: 16, letterSpacing: 1 }}>
          <i className="fas fa-user-plus" style={{ marginRight: 8 }} />DAILY SIGN‑UPS (LAST 30 DAYS)
        </h3>
        {dailySignups && dailySignups.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySignups} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: 'none', color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="count" stroke="var(--neon-blue)" strokeWidth={2} dot={{ r: 2, fill: 'var(--neon-blue)' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p style={{ color: 'var(--text-dim)' }}>No signup data.</p>}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', marginBottom: 16, letterSpacing: 1 }}>
          <i className="fas fa-layer-group" style={{ marginRight: 8 }} />MODULE PROGRESS
        </h3>
        {data?.moduleProgress?.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)' }}>Module</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)' }}>Lessons</th>
              </tr>
            </thead>
            <tbody>
              {data.moduleProgress.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-main)' }}>{m.title}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--neon-blue)' }}>{m.lessonCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--text-dim)' }}>No module data.</p>}
      </div>
    </div>
  );
}
