import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Spinner, EmptyState } from '../components/ui/index.jsx';

const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' };
const RANK_COLORS = { 1:'var(--neon-yellow)', 2:'#aab4be', 3:'#cd7f32' };

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(({ data }) => {
      setUsers(data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="LOADING LEADERBOARD" />;

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div>
      <div className="page-header">
        <div className="container" style={{ textAlign:'center' }}>
          <span className="badge badge-yellow" style={{ marginBottom:12 }}><i className="fas fa-trophy" /> LEADERBOARD</span>
          <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.5rem,3vw,2.2rem)', marginBottom:8 }}>
            TOP <span style={{ color:'var(--neon-yellow)' }}>AI LEARNERS</span>
          </h1>
          <p style={{ color:'var(--text-muted)' }}>Ranked by reputation score. Complete lessons & quizzes to climb the board.</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom:60 }}>
        {users.length === 0 ? (
          <EmptyState emoji="🏆" title="NO RANKINGS YET" description="Complete lessons to appear on the leaderboard." />
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:32, alignItems:'end' }}>
                {/* 2nd */}
                {top3[1] && (
                  <div className="card" style={{ textAlign:'center', padding:'24px 16px', borderColor:'rgba(170,180,190,0.2)', order:0 }}>
                    <div style={{ fontSize:'2rem', marginBottom:4 }}>🥈</div>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(170,180,190,0.1)', border:'2px solid rgba(170,180,190,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:'1.3rem' }}>
                      {top3[1].username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }}>{top3[1].username}</div>
                    <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', color:'#aab4be' }}>{top3[1].reputationScore}</div>
                    <div style={{ color:'var(--text-dim)', fontSize:'0.72rem', marginTop:4 }}>REP</div>
                  </div>
                )}
                {/* 1st */}
                {top3[0] && (
                  <div className="card" style={{
                    textAlign:'center', padding:'32px 16px',
                    borderColor:'rgba(255,214,0,0.3)',
                    background:'linear-gradient(135deg, rgba(255,214,0,0.04), rgba(255,214,0,0.01))',
                    boxShadow:'0 0 30px rgba(255,214,0,0.08)',
                    order:1,
                  }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:4 }}>🥇</div>
                    <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,214,0,0.12)', border:'2px solid rgba(255,214,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'1.6rem', boxShadow:'0 0 20px rgba(255,214,0,0.2)' }}>
                      {top3[0].username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:4 }}>{top3[0].username}</div>
                    <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'1rem', color:'var(--neon-yellow)' }}>{top3[0].reputationScore}</div>
                    <div style={{ color:'var(--text-dim)', fontSize:'0.72rem', marginTop:4 }}>REP</div>
                    {top3[0].isPremium && <span className="badge badge-yellow" style={{ marginTop:8 }}><i className="fas fa-star" /> PRO</span>}
                  </div>
                )}
                {/* 3rd */}
                {top3[2] && (
                  <div className="card" style={{ textAlign:'center', padding:'24px 16px', borderColor:'rgba(205,127,50,0.2)', order:2 }}>
                    <div style={{ fontSize:'2rem', marginBottom:4 }}>🥉</div>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(205,127,50,0.1)', border:'2px solid rgba(205,127,50,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:'1.3rem' }}>
                      {top3[2].username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }}>{top3[2].username}</div>
                    <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', color:'#cd7f32' }}>{top3[2].reputationScore}</div>
                    <div style={{ color:'var(--text-dim)', fontSize:'0.72rem', marginTop:4 }}>REP</div>
                  </div>
                )}
              </div>
            )}

            {/* Full table */}
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width:60 }}>RANK</th>
                    <th>USER</th>
                    <th style={{ textAlign:'right' }}>REPUTATION</th>
                    <th style={{ textAlign:'right' }}>LESSONS</th>
                    <th style={{ textAlign:'right', display:'table-cell' }}>JOINED</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const isMe = u.username === user?.username;
                    return (
                      <tr key={u._id} style={{ background: isMe ? 'rgba(0,255,163,0.03)' : u.rank <= 3 ? 'rgba(255,214,0,0.02)' : undefined }}>
                        <td>
                          <span style={{
                            fontFamily:'Orbitron,sans-serif', fontWeight:900, fontSize:'0.85rem',
                            color: RANK_COLORS[u.rank] || 'var(--text-dim)',
                          }}>
                            {MEDALS[u.rank] || `#${u.rank}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{
                              width:34, height:34, borderRadius:'50%', flexShrink:0,
                              background: isMe ? 'rgba(0,255,163,0.15)' : 'rgba(255,255,255,0.05)',
                              border: isMe ? '2px solid rgba(0,255,163,0.5)' : '1px solid rgba(255,255,255,0.1)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontWeight:700, fontSize:'0.85rem', color: isMe ? 'var(--neon-green)' : 'var(--text-muted)',
                            }}>
                              {u.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontWeight:700, color: isMe ? 'var(--neon-green)' : 'var(--text-main)', fontSize:'0.9rem' }}>
                                {u.username} {isMe && <span style={{ color:'var(--neon-green)', fontSize:'0.68rem' }}>(you)</span>}
                              </span>
                              {u.isPremium && <span className="badge badge-yellow" style={{ marginLeft:8, fontSize:'0.6rem', padding:'1px 6px' }}>PRO</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign:'right', fontFamily:'Orbitron,sans-serif', color:'var(--neon-yellow)', fontWeight:700 }}>
                          {u.reputationScore}
                        </td>
                        <td style={{ textAlign:'right', color:'var(--text-muted)' }}>{u.completedLessons || 0}</td>
                        <td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:'0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-KE', { month:'short', year:'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
