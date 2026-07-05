import { useState } from 'react';
import { adminAPI } from '../../services/adminApi';
import { useFetch } from '../../hooks/index.js';
import { Spinner, Alert, Modal, EmptyState } from '../../components/ui/index.jsx';

const QUESTION_TYPES = ['multiple-choice', 'true-false', 'short-answer'];

const defaultQuestion = { questionText: '', type: 'multiple-choice', options: ['', ''], correctAnswer: '', points: 1 };

function QuizForm({ quiz, onSave, onClose }) {
  const [form, setForm] = useState(quiz || { moduleId: '', title: '', description: '', passingScore: 70, questions: [], isPublished: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: modulesData } = useFetch(() => adminAPI.getModules());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) { setError(err.response?.data?.message || 'Error saving quiz.'); }
    finally { setSaving(false); }
  };

  const change = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addQuestion = () => setForm(p => ({ ...p, questions: [...p.questions, { ...defaultQuestion, options: ['', ''] }] }));

  const removeQuestion = (i) => setForm(p => ({ ...p, questions: p.questions.filter((_, idx) => idx !== i) }));

  const updateQuestion = (i, k, v) => setForm(p => {
    const qs = [...p.questions];
    qs[i] = { ...qs[i], [k]: v };
    return { ...p, questions: qs };
  });

  const updateOption = (qi, oi, v) => setForm(p => {
    const qs = [...p.questions];
    const opts = [...qs[qi].options];
    opts[oi] = v;
    qs[qi] = { ...qs[qi], options: opts };
    return { ...p, questions: qs };
  });

  const addOption = (qi) => setForm(p => {
    const qs = [...p.questions];
    qs[qi] = { ...qs[qi], options: [...qs[qi].options, ''] };
    return { ...p, questions: qs };
  });

  const removeOption = (qi, oi) => setForm(p => {
    const qs = [...p.questions];
    qs[qi] = { ...qs[qi], options: qs[qi].options.filter((_, idx) => idx !== oi) };
    return { ...p, questions: qs };
  });

  const modules = modulesData?.data || [];

  return (
    <Modal title={quiz?._id ? 'EDIT QUIZ' : 'CREATE QUIZ'} onClose={onClose} width={750}>
      <form onSubmit={handleSubmit}>
        {error && <Alert type="error">{error}</Alert>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label>Title</label>
            <input value={form.title} onChange={e => change('title', e.target.value)} required />
          </div>
          <div>
            <label>Module</label>
            <select value={form.moduleId} onChange={e => change('moduleId', e.target.value)} required>
              <option value="">Select module...</option>
              {modules.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}><label>Description</label><input value={form.description} onChange={e => change('description', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label>Passing Score (%)</label>
            <input type="number" value={form.passingScore} onChange={e => change('passingScore', Number(e.target.value))} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, paddingTop: 22 }}>
            <input type="checkbox" checked={form.isPublished} onChange={e => change('isPublished', e.target.checked)} /> Published
          </label>
        </div>

        <h4 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-yellow)', marginBottom: 14, letterSpacing: 1 }}>
          QUESTIONS ({form.questions.length})
          <button type="button" onClick={addQuestion} style={{ marginLeft: 12, background: 'none', border: '1px solid var(--neon-green)', color: 'var(--neon-green)', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>
            + ADD
          </button>
        </h4>

        {form.questions.map((q, qi) => (
          <div key={qi} style={{ padding: 14, marginBottom: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.75rem', color: 'var(--text-dim)' }}>Q{qi + 1}</span>
              <button type="button" onClick={() => removeQuestion(qi)}
                style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer', fontSize: '0.8rem' }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div><label>Question</label><input value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} required /></div>
              <div><label>Type</label><select value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)}>
                {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
              <div><label>Points</label><input type="number" value={q.points} onChange={e => updateQuestion(qi, 'points', Number(e.target.value))} /></div>
            </div>
            {q.type === 'multiple-choice' && (
              <div style={{ marginBottom: 10 }}>
                <label>Options</label>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} style={{ flex: 1 }} />
                    <button type="button" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2}
                      style={{ background: 'none', border: 'none', color: 'var(--neon-red)', cursor: 'pointer', opacity: q.options.length <= 2 ? 0.3 : 1 }}>
                      <i className="fas fa-minus-circle" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addOption(qi)}
                  style={{ background: 'none', border: 'none', color: 'var(--neon-blue)', cursor: 'pointer', fontSize: '0.78rem', marginTop: 6 }}>
                  + Add option
                </button>
              </div>
            )}
            {q.type === 'true-false' && (
              <div style={{ marginBottom: 10 }}>
                <label>Correct Answer</label>
                <select value={q.correctAnswer} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="">Select...</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}
            <div>
              <label>Correct Answer</label>
              <input value={q.correctAnswer} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)} required />
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          {saving ? <><i className="fas fa-circle-notch fa-spin" /> Saving...</> : <><i className="fas fa-save" /> SAVE QUIZ</>}
        </button>
      </form>
    </Modal>
  );
}

function QuizResults({ quizId, onClose }) {
  const { data, loading } = useFetch(() => adminAPI.getQuizResults(quizId));

  if (loading) return <Spinner text="LOADING RESULTS" />;

  const { attempts = [], avgScore = 0, totalAttempts = 0, quizTitle = '' } = data?.data || {};

  return (
    <Modal title={`RESULTS: ${quizTitle}`} onClose={onClose} width={650}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.8rem', color: 'var(--neon-green)' }}>{totalAttempts}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ATTEMPTS</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.8rem', color: 'var(--neon-yellow)' }}>{avgScore}%</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>AVG SCORE</div>
        </div>
      </div>
      {attempts.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No attempts yet.</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)' }}>User</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-muted)' }}>Score</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-muted)' }}>Passed</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-main)' }}>{a.userId?.username || 'N/A'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'Orbitron,sans-serif', color: 'var(--neon-blue)' }}>{a.score}%</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ color: a.passed ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 700 }}>
                      {a.passed ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default function QuizManagement() {
  const { data, loading, refetch } = useFetch(() => adminAPI.getQuizzes());
  const [showForm, setShowForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [viewResults, setViewResults] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState('');

  const quizzes = data?.data || [];

  const handleSave = async (form) => {
    if (editQuiz?._id) await adminAPI.updateQuiz(editQuiz._id, form);
    else await adminAPI.createQuiz(form);
    setMsg('Quiz saved.');
    refetch();
  };

  const handleDelete = async (id) => {
    await adminAPI.deleteQuiz(id);
    setConfirmDelete(null);
    setMsg('Quiz deleted.');
    refetch();
  };

  if (loading) return <Spinner text="LOADING QUIZZES" />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.3rem', color: 'var(--neon-green)', marginBottom: 4 }}>QUIZ MANAGEMENT</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{quizzes.length} quizzes total.</p>
        </div>
        <button onClick={() => { setEditQuiz(null); setShowForm(true); }} className="btn btn-primary btn-sm">
          <i className="fas fa-plus" /> NEW QUIZ
        </button>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      {quizzes.length === 0 ? (
        <EmptyState emoji="❓" title="No Quizzes Yet" description="Create your first quiz to assess learner knowledge." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-muted)' }}>Module</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Questions</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Passing</th>
                <th style={{ textAlign: 'center', padding: '10px 14px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontWeight: 600 }}>{q.title}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>{q.moduleId?.title || 'N/A'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>{q.questions?.length || 0}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--neon-yellow)', fontFamily: 'Orbitron,sans-serif' }}>{q.passingScore}%</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                      color: q.isPublished ? 'var(--neon-green)' : 'var(--text-dim)',
                      background: q.isPublished ? 'rgba(0,255,163,0.1)' : 'rgba(255,255,255,0.04)',
                    }}>{q.isPublished ? 'LIVE' : 'DRAFT'}</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button onClick={() => setViewResults(q._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--neon-blue)', cursor: 'pointer', marginRight: 8 }}>
                      <i className="fas fa-chart-bar" />
                    </button>
                    <button onClick={() => { setEditQuiz(q); setShowForm(true); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', marginRight: 8 }}>
                      <i className="fas fa-edit" />
                    </button>
                    <button onClick={() => setConfirmDelete({ id: q._id, title: q.title })}
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

      {showForm && <QuizForm quiz={editQuiz} onSave={handleSave} onClose={() => { setShowForm(false); setEditQuiz(null); }} />}
      {viewResults && <QuizResults quizId={viewResults} onClose={() => setViewResults(null)} />}

      {confirmDelete && (
        <Modal title="CONFIRM DELETE" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Delete quiz <strong style={{ color: 'var(--neon-red)' }}>"{confirmDelete.title}"</strong>? All attempts will be removed.</p>
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
