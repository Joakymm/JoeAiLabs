import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../../services/api';
import { useFetch }   from '../../hooks/index.js';
import { Spinner, Alert } from '../../components/ui/index.jsx';
import CelebrationModal from '../../components/ui/CelebrationModal.jsx';

/* ── Simple markdown-ish renderer (no external lib needed) ────────────────── */
function renderContent(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    elements.push(
      <table key={`tbl-${elements.length}`}>
        <tbody>
          {tableRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                ri === 0 ? <th key={ci}>{cell}</th> : <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(<pre key={`cb-${elements.length}`}><code>{codeLines.join('\n')}</code></pre>);
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|') && line.includes('|')) {
      if (line.includes('---')) continue;
      flushTable();
      inTable = true;
      const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else {
      if (inTable) { flushTable(); inTable = false; }
    }

    if (line.startsWith('# '))   { elements.push(<h1 key={`h1-${elements.length}`}>{inlineFormat(line.slice(2))}</h1>); continue; }
    if (line.startsWith('## '))  { elements.push(<h2 key={`h2-${elements.length}`}>{inlineFormat(line.slice(3))}</h2>); continue; }
    if (line.startsWith('### ')) { elements.push(<h3 key={`h3-${elements.length}`}>{inlineFormat(line.slice(4))}</h3>); continue; }
    if (line.startsWith('> '))   { elements.push(<blockquote key={`bq-${elements.length}`}>{inlineFormat(line.slice(2))}</blockquote>); continue; }
    if (line.startsWith('- ') || line.startsWith('● ')) { elements.push(<li key={`li-${elements.length}`}>{inlineFormat(line.slice(2))}</li>); continue; }
    if (line.match(/^\d+\. /))   { elements.push(<li key={`li-${elements.length}`}>{inlineFormat(line.replace(/^\d+\. /, ''))}</li>); continue; }
    if (line === '')             { elements.push(<br key={`br-${elements.length}`} />); continue; }
    elements.push(<p key={`p-${elements.length}`}>{inlineFormat(line)}</p>);
  }

  if (inCodeBlock) {
    elements.push(<pre key={`cb-${elements.length}`}><code>{codeLines.join('\n')}</code></pre>);
  }
  if (inTable) flushTable();

  return elements;
}

function inlineFormat(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2,-2)}</strong>;
    if (part.startsWith('`')  && part.endsWith('`'))  return <code key={i}>{part.slice(1,-1)}</code>;
    return part;
  });
}

export default function LessonPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(() => lessonsAPI.get(id), [id]);

  const [completing, setCompleting] = useState(false);
  const [doneMsg,    setDoneMsg]    = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  if (loading) return <Spinner text="LOADING LESSON" />;
  if (error)   return (
    <div className="container" style={{ padding:60, textAlign:'center' }}>
      <p style={{ color:'var(--neon-red)', fontFamily:'Orbitron,sans-serif', marginBottom:20 }}>
        {error.includes('Premium') ? '🔒 PREMIUM CONTENT — Upgrade your account to access this lesson.' : error}
      </p>
      <Link to="/modules" className="btn btn-secondary">← BACK TO MODULES</Link>
    </div>
  );

  const { lesson, isCompleted, nextLesson } = data || {};

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await lessonsAPI.complete(id);
      setDoneMsg(res.data?.message || 'Lesson complete!');
      const celebrated = localStorage.getItem('joeailabs_celebrated');
      if (!celebrated && !isCompleted) {
        localStorage.setItem('joeailabs_celebrated', 'true');
        setShowCelebration(true);
      }
      refetch();
    } catch (e) {
      setDoneMsg(e.response?.data?.message || 'Error marking complete.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div>
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{ background:'rgba(2,5,8,0.9)', borderBottom:'1px solid rgba(0,255,163,0.1)', padding:'12px 24px' }}>
        <div className="container-sm" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <Link to={`/modules/${lesson?.moduleId?._id || lesson?.moduleId}`}
            style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:8 }}>
            <i className="fas fa-arrow-left" />
            <span>{lesson?.moduleId?.title || 'Module'}</span>
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>
              <i className="fas fa-clock" style={{ marginRight:4 }} />{lesson?.duration}m
            </span>
            {isCompleted && <span className="badge badge-green"><i className="fas fa-check" /> Completed</span>}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="container-sm" style={{ padding:'48px 24px' }}>
        <h1 style={{ fontFamily:'Orbitron,sans-serif', fontSize:'clamp(1.2rem,3vw,1.8rem)', color:'var(--neon-green)', marginBottom:32, lineHeight:1.3 }}>
          {lesson?.title}
        </h1>

        {doneMsg && <Alert type="success">{doneMsg}</Alert>}

        {/* Main content */}
        <div className="lesson-body" style={{ marginBottom:40 }}>
          {renderContent(lesson?.content)}
        </div>

        {/* Key Takeaways */}
        {lesson?.keyTakeaways?.length > 0 && (
          <div className="card" style={{ marginBottom:24, borderColor:'rgba(0,255,163,0.2)', background:'rgba(0,255,163,0.03)' }}>
            <h4 style={{ color:'var(--neon-green)', fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', letterSpacing:2, marginBottom:14 }}>
              <i className="fas fa-key" style={{ marginRight:8 }} /> KEY TAKEAWAYS
            </h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
              {lesson.keyTakeaways.map((t, i) => (
                <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', color:'var(--text-muted)', fontSize:'0.9rem' }}>
                  <i className="fas fa-circle-check" style={{ color:'var(--neon-green)', marginTop:3, flexShrink:0 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {lesson?.tips?.length > 0 && (
          <div className="card" style={{ marginBottom:32, borderColor:'rgba(255,214,0,0.2)', background:'rgba(255,214,0,0.03)' }}>
            <h4 style={{ color:'var(--neon-yellow)', fontFamily:'Orbitron,sans-serif', fontSize:'0.85rem', letterSpacing:2, marginBottom:14 }}>
              <i className="fas fa-lightbulb" style={{ marginRight:8 }} /> PRO TIPS
            </h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
              {lesson.tips.map((t, i) => (
                <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', color:'var(--text-muted)', fontSize:'0.9rem' }}>
                  <i className="fas fa-bolt" style={{ color:'var(--neon-yellow)', marginTop:3, flexShrink:0 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, paddingTop:24, borderTop:'1px solid rgba(0,255,163,0.1)' }}>
          <Link to={`/modules/${lesson?.moduleId?._id || lesson?.moduleId}`} className="btn btn-ghost btn-sm">
            <i className="fas fa-arrow-left" /> Back to Module
          </Link>

          <div style={{ display:'flex', gap:12 }}>
            {!isCompleted ? (
              <button onClick={handleComplete} className="btn btn-primary" disabled={completing}>
                {completing
                  ? <><i className="fas fa-circle-notch fa-spin" /> Saving...</>
                  : <><i className="fas fa-check" /> MARK COMPLETE</>}
              </button>
            ) : (
              nextLesson
                ? <Link to={`/lessons/${nextLesson._id}`} className="btn btn-primary">
                    NEXT LESSON <i className="fas fa-arrow-right" />
                  </Link>
                : <Link to="/modules" className="btn btn-primary">
                    <i className="fas fa-trophy" /> BACK TO MODULES
                  </Link>
            )}
          </div>
        </div>
      </div>

      {showCelebration && <CelebrationModal onClose={() => setShowCelebration(false)} />}
    </div>
  );
}
