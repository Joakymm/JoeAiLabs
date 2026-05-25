import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizzesAPI } from '../../services/api';
import { Spinner, Alert, ProgressBar } from '../../components/ui/index.jsx';

export default function QuizPage() {
  const { moduleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  
  // Quiz taking state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // maps questionId -> answer string
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // stores attempt response from server

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await quizzesAPI.getByModule(moduleId);
        if (data.success && data.data) {
          setQuiz(data.data);
        } else {
          setError('Quiz not found for this module.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading quiz. Please ensure it is published.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [moduleId]);

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(p => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(p => p - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Format answers for API payload: array of { questionId, answer }
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans
      }));

      const { data } = await quizzesAPI.submit(quiz._id, formattedAnswers);
      if (data.success) {
        setResult(data.data);
      } else {
        setError('Submission failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="ESTABLISHING SECURE QUIZ LINK..." />;

  if (error && !quiz) {
    return (
      <div className="container" style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>⚠️</div>
        <p style={{ color: 'var(--neon-red)', fontFamily: 'Orbitron,sans-serif', marginBottom: 20 }}>{error}</p>
        <Link to={`/modules/${moduleId}`} className="btn btn-secondary">← BACK TO MODULE</Link>
      </div>
    );
  }

  if (result) {
    const { attempt, quiz: fullQuiz, repAdded } = result;
    const isPassed = attempt.passed;

    return (
      <div className="container-sm" style={{ padding: '60px 24px' }}>
        <div className="card" style={{
          textAlign: 'center', padding: '40px 28px',
          borderColor: isPassed ? 'rgba(0,255,163,0.3)' : 'rgba(255,60,90,0.3)',
          background: isPassed ? 'rgba(0,255,163,0.02)' : 'rgba(255,60,90,0.02)',
          marginBottom: 32
        }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>
            {isPassed ? '🏆' : '💀'}
          </div>
          
          <h2 style={{
            fontFamily: 'Orbitron,sans-serif',
            color: isPassed ? 'var(--neon-green)' : 'var(--neon-red)',
            letterSpacing: 2,
            marginBottom: 8
          }}>
            {isPassed ? 'ASSESSMENT PASSED' : 'ASSESSMENT FAILED'}
          </h2>
          
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            {isPassed
              ? 'Congratulations! You have verified your modular credentials successfully.'
              : 'Knowledge base is insufficient. Review your notes and try again.'}
          </p>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 28 }}>
            <div className="card" style={{ padding: '16px 24px', minWidth: 140, textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Orbitron,sans-serif',
                fontSize: '2rem',
                color: isPassed ? 'var(--neon-green)' : 'var(--neon-red)',
                fontWeight: 800
              }}>
                {attempt.score}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: 1 }}>YOUR SCORE</div>
            </div>

            <div className="card" style={{ padding: '16px 24px', minWidth: 140, textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Orbitron,sans-serif',
                fontSize: '2rem',
                color: 'var(--neon-yellow)',
                fontWeight: 800
              }}>
                {fullQuiz.passingScore}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: 1 }}>REQUIRED</div>
            </div>
          </div>

          {repAdded > 0 && (
            <div style={{
              background: 'rgba(255,214,0,0.1)',
              border: '1px solid rgba(255,214,0,0.3)',
              color: 'var(--neon-yellow)',
              padding: '12px 20px',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 700,
              fontFamily: 'Orbitron,sans-serif',
              fontSize: '0.9rem',
              letterSpacing: 1,
              marginBottom: 24
            }}>
              <i className="fas fa-star" />
              <span>+{repAdded} REPUTATION SCORE AWARDED!</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to={`/modules/${moduleId}`} className="btn btn-secondary">
              ← BACK TO MODULE
            </Link>
            {!isPassed && (
              <button onClick={() => { setResult(null); setCurrentIdx(0); setAnswers({}); }} className="btn btn-primary">
                RETRY ASSESSMENT
              </button>
            )}
          </div>
        </div>

        {/* side-by-side Review Section */}
        <h3 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: 20, letterSpacing: 1 }}>
          ASSESSMENT ANALYSIS
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fullQuiz.questions.map((q, idx) => {
            // Find user's answer
            const userAnsObj = attempt.answers.find(a => a.questionId.toString() === q._id.toString());
            const userAns = userAnsObj ? userAnsObj.answer : 'No answer submitted';
            const isCorrect = userAnsObj ? userAnsObj.isCorrect : false;

            return (
              <div key={q._id} className="card" style={{
                borderLeft: `4px solid ${isCorrect ? 'var(--neon-green)' : 'var(--neon-red)'}`,
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.8rem', color: 'var(--text-dim)', letterSpacing: 1 }}>
                    QUESTION {idx + 1}
                  </span>
                  <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`}>
                    {isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>

                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 16 }}>{q.questionText}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                  <div style={{
                    padding: 12, borderRadius: 8,
                    background: isCorrect ? 'rgba(0,255,163,0.03)' : 'rgba(255,60,90,0.03)',
                    border: `1px solid ${isCorrect ? 'rgba(0,255,163,0.1)' : 'rgba(255,60,90,0.1)'}`
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>YOUR ANSWER</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isCorrect ? 'var(--neon-green)' : '#ff6680' }}>
                      {userAns}
                    </div>
                  </div>

                  <div style={{
                    padding: 12, borderRadius: 8,
                    background: 'rgba(0,212,255,0.03)',
                    border: '1px solid rgba(0,212,255,0.1)'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>CORRECT ANSWER</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--neon-blue)' }}>
                      {q.correctAnswer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const pctProgress = Math.round((answeredCount / quiz.questions.length) * 100);

  return (
    <div className="container-sm" style={{ padding: '40px 24px' }}>
      {/* Quiz Top Metadata */}
      <div style={{ marginBottom: 28 }}>
        <Link to={`/modules/${moduleId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <i className="fas fa-arrow-left" /> Back to Module
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            <span className="badge badge-yellow" style={{ marginBottom: 8 }}>ASSESSMENT MODULE</span>
            <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '1.4rem', color: 'var(--text-main)', letterSpacing: 1.5 }}>
              {quiz.title}
            </h1>
          </div>
          <div style={{ fontFamily: 'Orbitron,sans-serif', fontSize: '0.85rem', color: 'var(--neon-green)', letterSpacing: 1 }}>
            {currentIdx + 1} / {quiz.questions.length} QUESTIONS
          </div>
        </div>

        <ProgressBar pct={pctProgress} height={6} />
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Immersive Question Card */}
      <div className="card" style={{ padding: '32px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'Orbitron,sans-serif', marginBottom: 16 }}>
          <span>MODULE QUESTION</span>
          <span>{currentQuestion.points || 1} PT(S)</span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.5, marginBottom: 28 }}>
          {currentQuestion.questionText}
        </h3>

        {/* Input selectors depending on type */}
        {currentQuestion.type === 'multiple-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQuestion.options.map(opt => {
              const isSelected = answers[currentQuestion._id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(currentQuestion._id, opt)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '16px 20px',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    letterSpacing: 0.5,
                    border: isSelected ? '1px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected ? 'rgba(0,255,163,0.06)' : 'rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--neon-green)' : 'var(--text-dim)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0
                  }}>
                    {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--neon-green)' }} />}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'true-false' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['True', 'False'].map(val => {
              const isSelected = answers[currentQuestion._id] === val;
              return (
                <button
                  key={val}
                  onClick={() => handleSelectOption(currentQuestion._id, val)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    padding: '30px 20px',
                    flexDirection: 'column',
                    gap: 12,
                    fontSize: '1rem',
                    fontFamily: 'Orbitron,sans-serif',
                    border: isSelected ? '1px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.06)',
                    background: isSelected ? 'rgba(0,255,163,0.06)' : 'rgba(0,0,0,0.2)'
                  }}
                >
                  <i className={`fas ${val === 'True' ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{
                    fontSize: '1.8rem',
                    color: isSelected ? 'var(--neon-green)' : val === 'True' ? 'var(--neon-blue)' : 'var(--neon-red)'
                  }} />
                  <span>{val.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'short-answer' && (
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: 8, letterSpacing: 1 }}>
              INPUT THE SECURE ANSWER KEY
            </label>
            <input
              type="text"
              placeholder="Type your answer here..."
              value={answers[currentQuestion._id] || ''}
              onChange={e => handleTextChange(currentQuestion._id, e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '0.95rem',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                outline: 'none',
                boxShadow: answers[currentQuestion._id] ? '0 0 15px rgba(0,255,163,0.1)' : 'none',
                borderColor: answers[currentQuestion._id] ? 'var(--neon-green)' : undefined
              }}
            />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: 10 }}>
              *Note: Grading is case-insensitive, but spelling must match the correct key.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="btn btn-ghost"
          style={{ opacity: currentIdx === 0 ? 0.3 : 1 }}
        >
          <i className="fas fa-arrow-left" style={{ marginRight: 8 }} /> PREVIOUS
        </button>

        {currentIdx < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion._id]}
            className="btn btn-primary"
            style={{ minWidth: 120 }}
          >
            NEXT <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < quiz.questions.length}
            className="btn btn-primary"
            style={{
              minWidth: 160,
              background: 'linear-gradient(90deg, var(--neon-green), var(--neon-blue))',
              borderColor: 'transparent',
              color: '#020508'
            }}
          >
            {submitting ? (
              <><i className="fas fa-circle-notch fa-spin" /> GRADING...</>
            ) : (
              <><i className="fas fa-paper-plane" /> SUBMIT QUIZ</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
