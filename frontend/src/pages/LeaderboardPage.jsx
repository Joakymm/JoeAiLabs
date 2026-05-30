import { useState, useEffect } from 'react';
import api from '../services/api';
import { Spinner } from '../components/ui/index.jsx';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/users/leaderboard');
        setUsers(data.data || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <Spinner text="LOADING LEADERBOARD" />;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span className="badge badge-yellow" style={{ marginBottom: 12 }}>LEADERBOARD</span>
        <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 8 }}>
          TOP <span style={{ color: 'var(--neon-yellow)' }}>AI LEARNERS</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Top 100 users ranked by reputation score.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 120px',
          gap: 12, padding: '12px 20px',
          background: 'rgba(0,255,163,0.05)', borderBottom: '1px solid rgba(0,255,163,0.1)',
          fontFamily: 'Orbitron,sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: 1,
        }}>
          <span>RANK</span>
          <span>USER</span>
          <span style={{ textAlign: 'right' }}>REP</span>
          <span style={{ textAlign: 'right' }}>LESSONS</span>
          <span style={{ textAlign: 'right' }}>JOINED</span>
        </div>
        {users.map((u) => (
          <div key={u._id} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 120px',
            gap: 12, padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
            background: u.rank <= 3 ? 'rgba(255,214,0,0.03)' : 'transparent',
          }}>
            <div style={{
              fontFamily: 'Orbitron,sans-serif', fontWeight: 700,
              color: u.rank === 1 ? 'var(--neon-yellow)' : u.rank === 2 ? 'var(--text-muted)' : u.rank === 3 ? '#cd7f32' : 'var(--text-dim)',
            }}>
              #{u.rank}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,255,163,0.1)', border: '1px solid rgba(0,255,163,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {u.avatar ? (
                  <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fas fa-user" style={{ fontSize: '0.75rem', color: 'var(--neon-green)' }} />
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{u.username}</span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'Orbitron,sans-serif', color: 'var(--neon-green)', fontWeight: 700 }}>
              {u.reputationScore}
            </div>
            <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {u.lessonsCompleted}
            </div>
            <div style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              {new Date(u.joinedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
