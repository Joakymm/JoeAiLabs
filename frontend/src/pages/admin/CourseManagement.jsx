import { useState } from 'react';
import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, Alert, Modal } from '../../components/ui/index.jsx';

const defaultModule = { title: '', subtitle: '', description: '', order: 1, emoji: '📚', color: 'green', isPremium: false, isPublished: true, estimatedHours: 2 };
const defaultLesson = { moduleId: '', title: '', content: '', summary: '', duration: 10, order: 1, tips: [], keyTakeaways: [], isPublished: true };

function ModuleForm({ module, onSave, onClose }) {
  const [form, setForm] = useState(module || defaultModule);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Error saving module.'); }
    finally { setSaving(false); }
  };

  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal title={module?._id ? 'EDIT MODULE' : 'CREATE MODULE'} onClose={onClose} width={600}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Title</label><input value={form.title} onChange={e => change('title', e.target.value)} required /></div>
          <div><label>Order</label><input type="number" value={form.order} onChange={e => change('order', Number(e.target.value))} required /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label>Subtitle</label><input value={form.subtitle} onChange={e => change('subtitle', e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><label>Description</label><textarea rows={3} value={form.description} onChange={e => change('description', e.target.value)} required /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Emoji</label><input value={form.emoji} onChange={e => change('emoji', e.target.value)} /></div>
          <div><label>Color</label><select value={form.color} onChange={e => change('color', e.target.value)}><option value="green">Green</option><option value="yellow">Yellow</option><option value="blue">Blue</option></select></div>
          <div><label>Est. Hours</label><input type="number" value={form.estimatedHours} onChange={e => change('estimatedHours', Number(e.target.value))} /></div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={form.isPremium} onChange={e => change('isPremium', e.target.checked)} /> Premium
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => change('isPublished', e.target.checked)} /> Published
          </label>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? <><i className="fas fa-circle-notch fa-spin" /> Saving...</> : <><i className="fas fa-save" /> SAVE MODULE</>}
        </button>
      </form>
    </Modal>
  );
}

function LessonForm({ lesson, moduleId, onSave, onClose }) {
  const [form, setForm] = useState(lesson ? { ...lesson, tips: lesson.tips?.join('\n') || '', keyTakeaways: lesson.keyTakeaways?.join('\n') || '' } : { ...defaultLesson, moduleId, tips: '', keyTakeaways: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const data = { ...form, tips: form.tips.split('\n').filter(Boolean), keyTakeaways: form.keyTakeaways.split('\n').filter(Boolean) };
      await onSave(data);
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Error saving lesson.'); }
    finally { setSaving(false); }
  };

  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal title={lesson?._id ? 'EDIT LESSON' : 'CREATE LESSON'} onClose={onClose} width={700}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><label>Title</label><input value={form.title} onChange={e => change('title', e.target.value)} required /></div>
          <div><label>Order</label><input type="number" value={form.order} onChange={e => change('order', Number(e.target.value))} required /></div>
          <div><label>Duration (min)</label><input type="number" value={form.duration} onChange={e => change('duration', Number(e.target.value))} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label>Summary</label><input value={form.summary} onChange={e => change('summary', e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}>
          <label>Content (Markdown)</label>
          <textarea rows={10} value={form.content} onChange={e => change('content', e.target.value)} required style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.85rem' }} />
        </div>
        <div style={{ marginBottom: 14 }}><label>Video URL</label><input value={form.videoUrl || ''} onChange={e => change('videoUrl', e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}>
          <label>Tips (one per line)</label>
          <textarea rows={3} value={form.tips} onChange={e => change('tips', e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label>Key Takeaways (one per line)</label>
          <textarea rows={3} value={form.keyTakeaways} onChange={e => change('keyTakeaways', e.target.value)} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, marginBottom: 20 }}>
          <input type="checkbox" checked={form.isPublished} onChange={e => change('isPublished', e.target.checked)} /> Published
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? <><i className="fas fa-circle-notch fa-spin" /> Saving...</> : <><i className="fas fa-save" /> SAVE LESSON</>}
        </button>
      </form>
    </Modal>
  );
}

export default function CourseManagement() {
  const { data: modules, loading, refetch } = useFetch(() => adminAPI.getModules());
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleLessons, setModuleLessons] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState('');

  const loadLessons = async (mod) => {
    setSelectedModule(mod);
    try {
      const { data } = await adminAPI.getLessons(mod._id);
      setModuleLessons(data.data || []);
    } catch { setModuleLessons([]); }
  };

  const handleSaveModule = async (form) => {
    if (editModule?._id) await adminAPI.updateModule(editModule._id, form);
    else await adminAPI.createModule(form);
    setMsg('Module saved.');
    refetch();
  };

  const handleDeleteModule = async (id) => {
    await adminAPI.deleteModule(id);
    setConfirmDelete(null);
    setSelectedModule(null);
    setModuleLessons(null);
    setMsg('Module deleted.');
    refetch();
  };

  const handleSaveLesson = async (form) => {
    if (editLesson?._id) await adminAPI.updateLesson(editLesson._id, form);
    else await adminAPI.createLesson(form);
    setMsg('Lesson saved.');
    if (selectedModule) loadLessons(selectedModule);
  };

  const handleDeleteLesson = async (id) => {
    await adminAPI.deleteLesson(id);
    setConfirmDelete(null);
    setMsg('Lesson deleted.');
    if (selectedModule) loadLessons(selectedModule);
  };

  if (loading) return <Spinner text="LOADING COURSES" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>COURSE MANAGEMENT</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Create and manage modules and lessons.</p>
        </div>
        <button onClick={() => { setEditModule(null); setShowModuleForm(true); }} className="btn btn-primary btn-sm">
          <i className="fas fa-plus" /> NEW MODULE
        </button>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: selectedModule ? '1fr 1.5fr' : '1fr', gap: 24 }}>
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {(modules?.data || []).map(mod => (
              <div key={mod._id} onClick={() => loadLessons(mod)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selectedModule?._id === mod._id ? 'rgba(0,255,163,0.06)' : 'transparent',
                  color: selectedModule?._id === mod._id ? 'var(--neon-green)' : 'var(--text-main)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{mod.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{mod.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{mod.lessonCount} lessons {mod.isPublished ? '' : '(draft)'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); setEditModule(mod); setShowModuleForm(true); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                    <i className="fas fa-edit" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete({ type: 'module', id: mod._id, title: mod.title }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer' }}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))}
            {(!modules?.data || modules.data.length === 0) && <p style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center' }}>No modules yet.</p>}
          </div>
        </div>

        {selectedModule && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem', color: 'var(--neon-green)' }}>
                {selectedModule.emoji} {selectedModule.title} — Lessons
              </h3>
              <button onClick={() => { setEditLesson(null); setShowLessonForm(true); }} className="btn btn-primary btn-sm">
                <i className="fas fa-plus" /> ADD LESSON
              </button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {(moduleLessons || []).map(lesson => (
                <div key={lesson._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'Orbitron,sans-serif', width: 24 }}>{lesson.order}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{lesson.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{lesson.duration}m {lesson.isPublished ? '' : '(draft)'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditLesson(lesson); setShowLessonForm(true); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                      <i className="fas fa-edit" />
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'lesson', id: lesson._id, title: lesson.title })}
                      style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer' }}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              ))}
              {(!moduleLessons || moduleLessons.length === 0) && <p style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center' }}>No lessons in this module.</p>}
            </div>
          </div>
        )}
      </div>

      {showModuleForm && <ModuleForm module={editModule} onSave={handleSaveModule} onClose={() => { setShowModuleForm(false); setEditModule(null); }} />}
      {showLessonForm && <LessonForm lesson={editLesson} moduleId={selectedModule?._id} onSave={handleSaveLesson} onClose={() => { setShowLessonForm(false); setEditLesson(null); }} />}

      {confirmDelete && (
        <Modal title="CONFIRM DELETE" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Delete <strong style={{ color: 'var(--neon-red)' }}>"{confirmDelete.title}"</strong>? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ flex: 1 }}>CANCEL</button>
            <button onClick={() => confirmDelete.type === 'module' ? handleDeleteModule(confirmDelete.id) : handleDeleteLesson(confirmDelete.id)}
              className="btn btn-secondary" style={{ flex: 1, borderColor: 'rgba(255,60,90,0.4)', color: 'var(--neon-red)' }}>
              <i className="fas fa-trash" /> DELETE
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
