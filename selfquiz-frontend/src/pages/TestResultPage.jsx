import { useLocation, useNavigate, Link } from 'react-router-dom';
import Markdown from '../components/Markdown';

export default function TestResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, deckId, deckName } = location.state || {};

  if (!result) {
    navigate('/');
    return null;
  }

  const scoreClass = result.percentage >= 90 ? 'excellent' : result.percentage >= 70 ? 'good' : result.percentage >= 50 ? 'average' : 'poor';

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="score-display">
          <div className={`score-number ${scoreClass}`}>{result.percentage}%</div>
          <div className="score-label">{result.evaluation}</div>
          <div className="score-details">
            <span><strong>{result.score}/{result.totalQuestions}</strong> câu đúng</span>
            <span>⏱️ <strong>{formatTime(result.timeTakenSeconds)}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <Link to={`/test/config/${deckId}`} className="btn btn-primary">🔄 Làm lại</Link>
          <Link to="/" className="btn btn-secondary">🏠 Trang chủ</Link>
        </div>

        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Chi tiết kết quả</h3>

        {result.results.map((r, idx) => {
          const isQuestionCorrect = r.isCorrect || r.correct;
          return (
          <div key={r.questionId} className={`question-review ${isQuestionCorrect ? 'correct' : 'wrong'}`}>
            <div className={`question-status ${isQuestionCorrect ? 'correct' : 'wrong'}`}>
              {isQuestionCorrect ? '✅ Đúng' : '❌ Sai'} — Câu {idx + 1}
            </div>
            <Markdown>{r.content}</Markdown>

            <div style={{ marginTop: '0.75rem' }}>
              {r.answers.map((a) => {
                let style = { padding: '0.5rem 0.75rem', marginBottom: '0.3rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)', background: 'var(--bg-input)' };
                
                const isCorrectAnswer = r.correctAnswerIds.includes(a.id);
                const isSelected = r.selectedAnswerIds.includes(a.id);

                if (isCorrectAnswer) style = { ...style, border: '1px solid var(--success)', background: 'var(--success-bg)' };
                if (isSelected && !isCorrectAnswer) style = { ...style, border: '1px solid var(--danger)', background: 'var(--danger-bg)' };
                
                let icon = '○';
                if (isCorrectAnswer) icon = '✅';
                else if (isSelected && !isCorrectAnswer) icon = '❌';

                return (
                  <div key={a.id} style={style}>
                    {icon} {a.content}
                  </div>
                );
              })}
            </div>

            {!isQuestionCorrect && r.explanation && (
              <div className="explanation-box">
                <strong>Giải thích</strong>
                <Markdown>{r.explanation}</Markdown>
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
