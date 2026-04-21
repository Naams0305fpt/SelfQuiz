import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { testApi } from '../services/api';
import Markdown from '../components/Markdown';
import toast from 'react-hot-toast';

export default function TestTakePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { deckId, numberOfQuestions, deckName } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!deckId) { navigate('/'); return; }
    const generate = async () => {
      try {
        const { data } = await testApi.generate({ deckId, numberOfQuestions });
        setQuestions(data.questions);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Lỗi tạo bài test');
        navigate(-1);
      } finally { setLoading(false); }
    };
    generate();
  }, []);

  const selectAnswer = (questionId, answerId) => {
    setAnswers({ ...answers, [questionId]: answerId });
  };

  const toggleFlag = () => {
    setFlagged({ ...flagged, [questions[currentIdx].questionId]: !flagged[questions[currentIdx].questionId] });
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.questionId]).length;
    if (unanswered > 0 && !window.confirm(`Còn ${unanswered} câu chưa trả lời. Bạn vẫn muốn nộp?`)) return;

    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    try {
      const { data } = await testApi.submit({
        deckId,
        timeTakenSeconds: timeTaken,
        answers: questions.map(q => ({
          questionId: q.questionId,
          selectedAnswerId: answers[q.questionId] || null,
        })).filter(a => a.selectedAnswerId),
      });
      navigate('/test/result', { state: { result: data, deckId, deckName } });
    } catch (e) {
      toast.error('Lỗi nộp bài');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-page" style={{ height: '100vh' }}><div className="spinner" /></div>;

  const q = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>📝 {deckName}</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Câu {currentIdx + 1} / {questions.length}
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div className="question-review" style={{ marginBottom: '1.5rem', borderLeft: flagged[q.questionId] ? '4px solid var(--warning)' : 'none' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Câu {currentIdx + 1} {flagged[q.questionId] ? '⚑' : ''}
          </div>
          <Markdown>{q.content}</Markdown>
        </div>

        {/* Answers */}
        <div className="radio-group">
          {q.answers.map((a) => (
            <div
              key={a.answerId}
              className={`radio-option ${answers[q.questionId] === a.answerId ? 'selected' : ''}`}
              onClick={() => selectAnswer(q.questionId, a.answerId)}
            >
              <div className="radio-dot" />
              <Markdown>{a.content}</Markdown>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}>
              ← Trước
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1}>
              Sau →
            </button>
            <button className="btn btn-secondary" onClick={toggleFlag}>
              {flagged[q.questionId] ? '⚑ Bỏ đánh dấu' : '⚐ Đánh dấu'}
            </button>
          </div>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang nộp...' : `📤 Nộp bài (${answeredCount}/${questions.length})`}
          </button>
        </div>

        {/* Question navigator */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1.5rem', justifyContent: 'center' }}>
          {questions.map((q, i) => (
            <button key={i} onClick={() => setCurrentIdx(i)} style={{
              width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${i === currentIdx ? 'var(--accent)' : 'var(--border)'}`,
              background: answers[q.questionId] ? 'var(--accent-glow)' : 'var(--bg-card)',
              color: flagged[q.questionId] ? 'var(--warning)' : answers[q.questionId] ? 'var(--accent-light)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: i === currentIdx ? '700' : '400', fontFamily: 'var(--font)',
            }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
