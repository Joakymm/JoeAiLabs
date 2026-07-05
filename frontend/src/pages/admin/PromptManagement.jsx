import { useState } from 'react';
import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, Alert, Modal, EmptyState } from '../../components/ui/index.jsx';

const TOOL_TYPES = ['image-generation', 'video-generation', 'voice-audio', 'writing-copy', 'code-generation', 'automation', 'research-analysis', 'presentation'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const defaultPrompt = {
  promptId: '', category: '', subcategory: '', title: '', promptText: '',
  placeholders: [], description: '', tags: [], difficulty: 'beginner',
  pluginsNeeded: [], estimatedTime: '5 min', toolType: 'writing-copy',
  toolName: '', isPublished: true,
  sampleOutput: { type: '', url: '', thumbnail: '', caption: '' },
  featured: false,
};

function PromptForm({ prompt, onSave, onClose }) {
  const [form, setForm] = useState(prompt ? {
    ...prompt,
    tags: prompt.tags?.join(', ') || '',
    placeholders: prompt.placeholders?.join(', ') || '',
    pluginsNeeded: prompt.pluginsNeeded?.join(', ') || '',
    sampleOutput: prompt.sampleOutput || { type: '', url: '', thumbnail: '', caption: '' },
  } : { ...defaultPrompt, tags: '', placeholders: '', pluginsNeeded: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        placeholders: form.placeholders.split(',').map(s => s.trim()).filter(Boolean),
        pluginsNeeded: form.pluginsNeeded.split(',').map(s => s.trim()).filter(Boolean),
      };
      await onSave(data);
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Error saving prompt.'); }
    finally { setSaving(false); }
  };

  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const changeSample = (k, v) => setForm(p => ({ ...p, sampleOutput: { ...p.sampleOutput, [k]: v } }));

  return (
    <Modal title={prompt?._id ? 'EDIT PROMPT' : 'CREATE PROMPT'} onClose={onClose} width={700}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Prompt ID</label><input value={form.promptId} onChange={e => change('promptId', e.target.value)} required /></div>
          <div><label>Title</label><input value={form.title} onChange={e => change('title', e.target.value)} required /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Category</label><input value={form.category} onChange={e => change('category', e.target.value)} required /></div>
          <div><label>Subcategory</label><input value={form.subcategory} onChange={e => change('subcategory', e.target.value)} /></div>
          <div><label>Difficulty</label><select value={form.difficulty} onChange={e => change('difficulty', e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Tool Type</label><select value={form.toolType} onChange={e => change('toolType', e.target.value)}>
            {TOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select></div>
          <div><label>Tool Name</label><input value={form.toolName} onChange={e => change('toolName', e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label>Description</label><input value={form.description} onChange={e => change('description', e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><label>Prompt Text</label><textarea rows={6} value={form.promptText} onChange={e => change('promptText', e.target.value)} required style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Tags (comma-separated)</label><input value={form.tags} onChange={e => change('tags', e.target.value)} /></div>
          <div><label>Placeholders (comma)</label><input value={form.placeholders} onChange={e => change('placeholders', e.target.value)} /></div>
          <div><label>Plugins (comma)</label><input value={form.pluginsNeeded} onChange={e => change('pluginsNeeded', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Est. Time</label><input value={form.estimatedTime} onChange={e => change('estimatedTime', e.target.value)} /></div>
          <div><label>Sample Output Type</label><select value={form.sampleOutput.type} onChange={e => changeSample('type', e.target.value)}>
            <option value="">None</option><option value="text">Text</option><option value="image">Image</option><option value="video">Video</option><option value="audio">Audio</option>
          </select></div>
        </div>
        {form.sampleOutput.type && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label>Sample URL</label><input value={form.sampleOutput.url} onChange={e => changeSample('url', e.target.value)} /></div>
            <div><label>Thumbnail URL</label><input value={form.sampleOutput.thumbnail} onChange={e => changeSample('thumbnail', e.target.value)} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label>Caption</label><input value={form.sampleOutput.caption || ''} onChange={e => changeSample('caption', e.target.value)} /></div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => change('isPublished', e.target.checked)} /> Published
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={form.featured || false} onChange={e => change('featured', e.target.checked)} /> <i className="fas fa-star" style={{ color:'#ffd700' }} /> Featured
          </label>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? <><i className="fas fa-circle-notch fa-spin" /> Saving...</> : <><i className="fas fa-save" /> SAVE PROMPT</>}
        </button>
      </form>
    </Modal>
  );
}

export default function PromptManagement() {
  const [params, setParams] = useState({ search: '', toolType: '', difficulty: '', page: 1 });
  const { data, loading, refetch } = useFetch(() => adminAPI.getPrompts(params));
  const [showForm, setShowForm] = useState(false);
  const [editPrompt, setEditPrompt] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const prompts = data?.data || [];
  const meta = data?.meta || { total: 0, pages: 1 };

  const handleSave = async (form) => {
    if (editPrompt?._id) await adminAPI.updatePrompt(editPrompt._id, form);
    else await adminAPI.createPrompt(form);
    setMsg('Prompt saved.');
    refetch();
  };

  const handleDelete = async (id) => {
    await adminAPI.deletePrompt(id);
    setConfirmDelete(null);
    setMsg('Prompt deleted.');
    refetch();
  };

  const handleToggleFeatured = async (id, val) => {
    await adminAPI.toggleFeatured(id, val);
    setMsg(val ? 'Prompt featured.' : 'Featured removed.');
    refetch();
  };

  const handleBulkImport = async () => {
    try {
      const prompts = JSON.parse(bulkData);
      const res = await adminAPI.bulkImportPrompts(Array.isArray(prompts) ? prompts : [prompts]);
      setMsg(`${res.data.count} prompts imported.`);
      setShowBulk(false);
      setBulkData('');
      refetch();
    } catch (err) {
      setMsg('Invalid JSON or import failed.');
    }
  };

  const changeParam = (k, v) => setParams(p => ({ ...p, [k]: v, page: k === 'page' ? v : 1 }));

  if (loading) return <Spinner text="LOADING PROMPTS" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>PROMPT LIBRARY</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{meta.total} prompts total.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowBulk(true)} className="btn btn-ghost btn-sm"><i className="fas fa-upload" /> BULK IMPORT</button>
          <button onClick={() => { setEditPrompt(null); setShowForm(true); }} className="btn btn-primary btn-sm"><i className="fas fa-plus" /> NEW PROMPT</button>
        </div>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Search prompts..." value={params.search} onChange={e => changeParam('search', e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }} />
          <select value={params.toolType} onChange={e => changeParam('toolType', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}>
            <option value="">All Types</option>
            {TOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={params.difficulty} onChange={e => changeParam('difficulty', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}>
            <option value="">All Difficulty</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {prompts.length === 0 ? (
        <EmptyState emoji="🔌" title="No Prompts Found" description="Adjust your filters or create a new prompt." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Difficulty</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Copies</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Featured</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontWeight: 600 }}>
                    {p.title}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.promptId}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--neon-blue)', fontSize: '0.8rem' }}>{p.toolName || p.toolType}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{p.category}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 600,
                      color: p.difficulty === 'advanced' ? 'var(--neon-red)' : p.difficulty === 'intermediate' ? 'var(--neon-yellow)' : 'var(--neon-green)',
                      background: 'rgba(255,255,255,0.04)',
                    }}>{p.difficulty}</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--neon-yellow)', fontFamily: 'Orbitron,sans-serif' }}>{p.copyCount}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                        color: p.isPublished ? 'var(--neon-green)' : 'var(--text-dim)',
                        background: p.isPublished ? 'rgba(0,255,163,0.1)' : 'rgba(255,255,255,0.04)',
                      }}>{p.isPublished ? 'LIVE' : 'DRAFT'}</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button onClick={() => handleToggleFeatured(p._id, !p.featured)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                          color: p.featured ? '#ffd700' : 'var(--text-dim)' }}>
                        <i className={`fas fa-star${p.featured ? '' : '-regular'}`} />
                      </button>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <button onClick={() => { setEditPrompt(p); setShowForm(true); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginRight: 8 }}>
                        <i className="fas fa-edit" />
                      </button>
                      <button onClick={() => setConfirmDelete({ id: p._id, title: p.title })}
                        style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer' }}>
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button onClick={() => { setEditPrompt(p); setShowForm(true); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginRight: 8 }}>
                      <i className="fas fa-edit" />
                    </button>
                    <button onClick={() => setConfirmDelete({ id: p._id, title: p.title })}
                      style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer' }}>
                      <i className="fas fa-trash" />
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

      {showForm && <PromptForm prompt={editPrompt} onSave={handleSave} onClose={() => { setShowForm(false); setEditPrompt(null); }} />}

      {showBulk && (
        <Modal title="BULK IMPORT PROMPTS" onClose={() => setShowBulk(false)} width={600}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '0.85rem' }}>Paste a JSON array of prompt objects.</p>
          <textarea rows={10} value={bulkData} onChange={e => setBulkData(e.target.value)}
            style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid rgba(0,255,163,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem', marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowBulk(false)} className="btn btn-ghost" style={{ flex: 1 }}>CANCEL</button>
            <button onClick={handleBulkImport} className="btn btn-primary" style={{ flex: 1 }}><i className="fas fa-upload" /> IMPORT</button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="CONFIRM DELETE" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Delete <strong style={{ color: 'var(--neon-red)' }}>"{confirmDelete.title}"</strong>? This cannot be undone.</p>
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
