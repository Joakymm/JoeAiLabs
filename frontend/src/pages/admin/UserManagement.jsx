import { useState } from 'react';
import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, Alert, Modal, EmptyState } from '../../components/ui/index.jsx';

const ROLES = ['user', 'seller', 'moderator', 'admin'];

export default function UserManagement() {
  const [params, setParams] = useState({ search: '', premium: '', page: 1 });
  const { data, loading, refetch } = useFetch(() => adminAPI.getUsers(params));
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState('');

  const users = data?.data || [];
  const meta = data?.meta || { total: 0, pages: 1 };

  const handleTogglePremium = async (user, val) => {
    await adminAPI.togglePremium(user._id, val);
    setMsg(`${user.username} premium ${val ? 'enabled' : 'disabled'}.`);
    refetch();
  };

  const handleRoleChange = async (user, role) => {
    await adminAPI.updateRole(user._id, role);
    setMsg(`${user.username} role updated to ${role}.`);
    refetch();
  };

  const handleDelete = async (id) => {
    await adminAPI.deleteUser(id);
    setConfirmDelete(null);
    setMsg('User deleted.');
    refetch();
  };

  const exportCSV = () => {
    const headers = 'Username,Email,Full Name,Role,Premium,Joined,Reputation\n';
    const rows = users.map(u =>
      `"${u.username}","${u.email}","${u.fullName || ''}","${u.role}","${u.isPremium}","${new Date(u.createdAt).toLocaleDateString()}","${u.reputationScore}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const changeParam = (k, v) => setParams(p => ({ ...p, [k]: v, page: k === 'page' ? v : 1 }));

  if (loading) return <Spinner text="LOADING USERS" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>USER MANAGEMENT</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{meta.total} total users.</p>
        </div>
        <button onClick={exportCSV} className="btn btn-ghost btn-sm"><i className="fas fa-download" /> EXPORT CSV</button>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Search users..." value={params.search} onChange={e => changeParam('search', e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }} />
          <select value={params.premium} onChange={e => changeParam('premium', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}>
            <option value="">All Users</option>
            <option value="true">Premium</option>
            <option value="false">Non-Premium</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState emoji="👥" title="No Users Found" description="Adjust your search or filters." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Username</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Joined</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Premium</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Role</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Rep</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button onClick={() => handleTogglePremium(u, !u.isPremium)}
                      style={{
                        padding: '4px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                        background: u.isPremium ? 'rgba(255,214,0,0.15)' : 'rgba(255,255,255,0.04)',
                        color: u.isPremium ? 'var(--neon-yellow)' : 'var(--text-dim)',
                      }}>
                      {u.isPremium ? 'PRO' : 'FREE'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <select value={u.role} onChange={e => handleRoleChange(u, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.15)',
                        background: 'rgba(0,0,0,0.3)', color: u.role === 'admin' ? 'var(--neon-green)' : 'var(--text-main)',
                        fontSize: '0.8rem', cursor: 'pointer',
                      }}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Orbitron,sans-serif', fontSize: '0.8rem' }}>{u.reputationScore}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button onClick={() => setConfirmDelete({ id: u._id, name: u.username })}
                      style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer' }}>
                      <i className="fas fa-user-slash" />
                    </button>
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
            <button key={i} onClick={() => changeParam('page', i + 1)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)',
                background: params.page === i + 1 ? 'rgba(0,255,163,0.15)' : 'transparent',
                color: params.page === i + 1 ? 'var(--neon-green)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'Orbitron,sans-serif', fontSize: '0.8rem',
              }}>{i + 1}</button>
          ))}
        </div>
      )}

      {confirmDelete && (
        <Modal title="CONFIRM DELETE" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Delete user <strong style={{ color: 'var(--neon-red)' }}>"{confirmDelete.name}"</strong>? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>CANCEL</button>
            <button onClick={() => handleDelete(confirmDelete.id)} className="btn btn-secondary" style={{ flex: 1, borderColor: 'rgba(255,60,90,0.4)', color: 'var(--neon-red)' }}>
              <i className="fas fa-trash" /> DELETE
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
