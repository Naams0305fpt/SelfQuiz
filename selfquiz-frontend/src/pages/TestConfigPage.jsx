import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deckApi, questionApi } from '../services/api';
import toast from 'react-hot-toast';

export default function TestConfigPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [deckRes, qRes] = await Promise.all([deckApi.getById(deckId), questionApi.getByDeck(deckId, 0, 1)]);
        setDeck(deckRes.data);
        const total = qRes.data.totalElements || qRes.data.content?.length || 0;
        setQuestionCount(total);
        setNumQuestions(Math.min(10, total));
      } catch (e) { toast.error('Lỗi tải dữ liệu'); }
      finally { setLoading(false); }
    };
    load();
  }, [deckId]);

  const startTest = () => {
    if (numQuestions < 1 || numQuestions > questionCount) {
      return toast.error(`Số câu phải từ 1 đến ${questionCount}`);
    }
    navigate('/test/take', { state: { deckId: Number(deckId), numberOfQuestions: numQuestions, deckName: deck?.name } });
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Môn học</Link><span className="sep">›</span>
        <Link to={`/decks/${deckId}`}>{deck?.name}</Link><span className="sep">›</span>
        <span>Cấu hình bài test</span>
      </div>

      <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="score-display">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{deck?.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{questionCount} câu hỏi có sẵn</p>
        </div>

        <div className="form-group">
          <label className="form-label">Số câu hỏi muốn làm</label>
          <input
            type="number"
            className="form-input"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            min={1}
            max={questionCount}
            style={{ fontSize: '1.2rem', textAlign: 'center', padding: '1rem' }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Tối thiểu 1, tối đa {questionCount}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={startTest}
          disabled={questionCount === 0}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
        >
          🚀 Bắt đầu làm bài
        </button>
      </div>
    </>
  );
}
