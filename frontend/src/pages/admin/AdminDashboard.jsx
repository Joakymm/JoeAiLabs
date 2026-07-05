import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, StatCard, SectionHeader } from '../../components/ui/index.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

const TooltipStyle = {
  contentStyle: { background:'var(--bg-dark)', border:'1px solid rgba(0,255,163,0.2)', borderRadius:8, color:'var(--text-main)', fontSize:'0.82rem' },
  labelStyle: { color:'var(--neon-green)', fontFamily:'Orbitron,sans-serif', fontSize:'0.72rem' },
};

export default function AdminDashboard() {
  const { data, loading } = useFetch(() => adminAPI.getAnalytics());

  if (loading) return <Spinner text="LOADING ADMIN DASHBOARD" />;

  const { overview = {}, revenue = {}, dailySignups = [] } = data || {};

  return (
    <div>
      <SectionHeader
        badge="ADMIN"
        title="DASHBOARD"
        subtitle="Platform overview at a glance."
      />

      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="fa-users"       label="Total Users"    value={overview.totalUsers || 0}   color="green" />
        <StatCard icon="fa-star"        label="PRO Users"      value={overview.premiumUsers || 0} color="yellow" />
        <StatCard icon="fa-user-plus"   label="New (30 days)"  value={overview.newSignups || 0}   color="blue" />
        <StatCard icon="fa-dollar-sign" label="Revenue"        value={`$${(revenue.totalRevenue || 0).toFixed(2)}`} color="green" />
      </div>

      <div className="grid-4" style={{ marginBottom:32 }}>
        <StatCard icon="fa-book"         label="Modules"     value={overview.totalModules || 0}    color="green" />
        <StatCard icon="fa-file-lines"   label="Lessons"     value={overview.totalLessons || 0}    color="blue" />
        <StatCard icon="fa-bolt"         label="Prompts"     value={overview.totalPrompts || 0}    color="yellow" />
        <StatCard icon="fa-check-double" label="Completions" value={overview.completedLessons || 0} color="green" />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        {/* Signups Chart */}
        <div className="card">
          <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-blue)', marginBottom:20, letterSpacing:1.5 }}>
            <i className="fas fa-user-plus" style={{ marginRight:8 }} />DAILY SIGN-UPS (30 DAYS)
          </h3>
          {dailySignups?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailySignups} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" tick={{ fill:'var(--text-dim)', fontSize:9 }} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-dim)', fontSize:9 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...TooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="var(--neon-blue)" strokeWidth={2.5} dot={false} activeDot={{ r:4, fill:'var(--neon-blue)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{ color:'var(--text-dim)', fontSize:'0.85rem', textAlign:'center', padding:'40px 0' }}>No signup data yet.</p>}
        </div>

        {/* Revenue Chart placeholder or bar if available */}
        <div className="card">
          <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-yellow)', marginBottom:20, letterSpacing:1.5 }}>
            <i className="fas fa-credit-card" style={{ marginRight:8 }} />TOP PROMPTS BY COPIES
          </h3>
          {data?.topPrompts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topPrompts.slice(0,6)} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="title" tick={{ fill:'var(--text-dim)', fontSize:8 }} tickLine={false}
                  tickFormatter={v => v.length > 12 ? v.slice(0,12)+'…' : v} />
                <YAxis tick={{ fill:'var(--text-dim)', fontSize:9 }} tickLine={false} axisLine={false} />
                <Tooltip {...TooltipStyle} />
                <Bar dataKey="copyCount" fill="var(--neon-yellow)" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color:'var(--text-dim)', fontSize:'0.85rem', textAlign:'center', padding:'40px 0' }}>No prompt data yet.</p>}
        </div>
      </div>

      {/* Tables */}
      <div className="grid-2">
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(0,255,163,0.08)' }}>
            <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-green)', letterSpacing:1.5 }}>
              <i className="fas fa-trophy" style={{ marginRight:8 }} />TOP PROMPTS
            </h3>
          </div>
          <table className="admin-table">
            <thead><tr><th>Prompt</th><th style={{ textAlign:'right' }}>Copies</th></tr></thead>
            <tbody>
              {data?.topPrompts?.slice(0,8).map(p => (
                <tr key={p._id}>
                  <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</td>
                  <td style={{ textAlign:'right', color:'var(--neon-yellow)', fontFamily:'Orbitron,sans-serif', fontWeight:700 }}>{p.copyCount}</td>
                </tr>
              )) || <tr><td colSpan={2} style={{ color:'var(--text-dim)', textAlign:'center' }}>No data</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(0,255,163,0.08)' }}>
            <h3 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.82rem', color:'var(--neon-blue)', letterSpacing:1.5 }}>
              <i className="fas fa-layer-group" style={{ marginRight:8 }} />MODULE BREAKDOWN
            </h3>
          </div>
          <table className="admin-table">
            <thead><tr><th>Module</th><th style={{ textAlign:'right' }}>Lessons</th></tr></thead>
            <tbody>
              {data?.moduleProgress?.slice(0,8).map((m, i) => (
                <tr key={i}>
                  <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</td>
                  <td style={{ textAlign:'right', color:'var(--neon-blue)', fontFamily:'Orbitron,sans-serif' }}>{m.lessonCount}</td>
                </tr>
              )) || <tr><td colSpan={2} style={{ color:'var(--text-dim)', textAlign:'center' }}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
