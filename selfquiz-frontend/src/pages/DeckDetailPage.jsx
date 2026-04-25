import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deckApi, questionApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Markdown from '../components/Markdown';
import ImportModal from '../components/ImportModal';
import toast from 'react-hot-toast';

export default function DeckDetailPage() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  const emptyForm = { content: '', explanation: '', answers: [{ content: '', isCorrect: true }, { content: '', isCorrect: false }] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [deckRes, qRes] = await Promise.all([deckApi.getById(id), questionApi.getByDeck(id, 0, 200)]);
      setDeck(deckRes.data);
      setQuestions(qRes.data.content || []);
    } catch (e) { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingQuestion(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setForm({ content: q.content, explanation: q.explanation, answers: q.answers.map(a => ({ content: a.content, isCorrect: a.correct || a.isCorrect })) });
    setShowModal(true);
  };

  const updateAnswer = (idx, field, value) => {
    const newAnswers = [...form.answers];
    if (field === 'isCorrect') {
      newAnswers[idx].isCorrect = value;
    } else {
      newAnswers[idx][field] = value;
    }
    setForm({ ...form, answers: newAnswers });
  };

  const addAnswer = () => {
    if (form.answers.length >= 5) return toast.error('Tối đa 5 đáp án');
    setForm({ ...form, answers: [...form.answers, { content: '', isCorrect: false }] });
  };

  const removeAnswer = (idx) => {
    if (form.answers.length <= 2) return toast.error('Tối thiểu 2 đáp án');
    const newAnswers = form.answers.filter((_, i) => i !== idx);
    if (!newAnswers.some(a => a.isCorrect)) newAnswers[0].isCorrect = true;
    setForm({ ...form, answers: newAnswers });
  };

  const handleSave = async () => {
    if (!form.content.trim()) return toast.error('Nội dung câu hỏi không được trống');
    if (!form.explanation.trim()) return toast.error('Giải thích không được trống');
    if (form.answers.some(a => !a.content.trim())) return toast.error('Nội dung đáp án không được trống');
    if (form.answers.filter(a => a.isCorrect).length < 1) return toast.error('Phải có ít nhất 1 đáp án đúng');

    try {
      const payload = {
        content: form.content,
        explanation: form.explanation,
        answers: form.answers.map(a => ({ content: a.content, correct: a.isCorrect }))
      };
      
      if (editingQuestion) {
        await questionApi.update(editingQuestion.id, payload);
        toast.success('Cập nhật thành công');
      } else {
        await questionApi.create(id, payload);
        toast.success('Thêm câu hỏi thành công');
      }
      setShowModal(false);
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const handleDelete = async () => {
    try {
      await questionApi.delete(deleteTarget.id);
      toast.success('Đã xóa câu hỏi');
      setDeleteTarget(null);
      if (activeQuestionIdx >= questions.length - 1) {
        setActiveQuestionIdx(Math.max(0, questions.length - 2));
      }
      loadData();
    } catch (e) { toast.error('Lỗi khi xóa'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Môn học</Link><span className="sep">›</span>
        <Link to={`/subjects/${deck?.subjectId}`}>...</Link><span className="sep">›</span>
        <span>{deck?.name}</span>
      </div>

      <div className="page-header">
        <div>
          <h1>{deck?.name}</h1>
          <p className="subtitle">{questions.length} câu hỏi {deck?.description ? `• ${deck.description}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/test/config/${id}`} className={`btn btn-secondary ${questions.length === 0 ? '' : ''}`}
            onClick={(e) => { if (questions.length === 0) { e.preventDefault(); toast.error('Chưa có câu hỏi'); } }}
            style={questions.length === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
            🎯 Làm bài
          </Link>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>📥 Import</button>
          <button className="btn btn-primary" onClick={openCreate}>＋ Thêm câu hỏi</button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">❓</div>
          <p>Chưa có câu hỏi nào. Bấm "Thêm câu hỏi" để bắt đầu!</p>
        </div>
      ) : (
        <div className="question-workspace">
          {/* Cột trái: Lưới điều hướng */}
          <div className="question-sidebar">
            <div className="sidebar-title">
              <span>Danh sách câu hỏi</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{questions.length} câu</span>
            </div>
            <div className="question-grid">
              {questions.map((q, idx) => (
                <button 
                  key={q.id}
                  className={`question-nav-btn ${activeQuestionIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveQuestionIdx(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Cột phải: Chi tiết câu hỏi đang chọn */}
          <div className="question-detail-pane">
            {questions[activeQuestionIdx] && (() => {
              const q = questions[activeQuestionIdx];
              return (
                <div className="question-review">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-light)', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Câu hỏi {activeQuestionIdx + 1}
                      </div>
                      <Markdown>{q.content}</Markdown>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button className="btn-icon" onClick={() => openEdit(q)} title="Sửa câu hỏi">✏️</button>
                      <button className="btn-icon" onClick={() => setDeleteTarget(q)} title="Xóa câu hỏi">🗑️</button>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '500' }}>Các đáp án:</h4>
                    {q.answers.map((a) => (
                      <div key={a.id} style={{ 
                        padding: '0.75rem 1rem', 
                        marginBottom: '0.5rem', 
                        borderRadius: 'var(--radius-md)', 
                        background: (a.correct || a.isCorrect) ? 'var(--success-bg)' : 'var(--bg-input)', 
                        border: `1px solid ${(a.correct || a.isCorrect) ? 'var(--success)' : 'var(--border)'}`, 
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {(a.correct || a.isCorrect) ? <span style={{color: 'var(--success)'}}>✅</span> : <span style={{color: 'var(--text-muted)'}}>○</span>} 
                        <span>{a.content}</span>
                      </div>
                    ))}
                    <div className="explanation-box" style={{ marginTop: '1.5rem' }}>
                      <strong>Giải thích chi tiết</strong>
                      <Markdown>{q.explanation}</Markdown>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung câu hỏi * (hỗ trợ Markdown)</label>
              <textarea className="form-textarea" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Nhập nội dung câu hỏi..." rows={4} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Đáp án ({form.answers.length}/5) — chọn các đáp án đúng</label>
              {form.answers.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <input type="checkbox" checked={a.isCorrect} onChange={(e) => updateAnswer(i, 'isCorrect', e.target.checked)} style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }} />
                  <input className="form-input" value={a.content} onChange={(e) => updateAnswer(i, 'content', e.target.value)} placeholder={`Đáp án ${i + 1}`} style={{ flex: 1 }} />
                  {form.answers.length > 2 && (
                    <button className="btn-icon" onClick={() => removeAnswer(i)} title="Xóa đáp án">✕</button>
                  )}
                </div>
              ))}
              {form.answers.length < 5 && (
                <button className="btn btn-secondary btn-sm" onClick={addAnswer} style={{ marginTop: '0.25rem' }}>＋ Thêm đáp án</button>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Giải thích * (hỗ trợ Markdown)</label>
              <textarea className="form-textarea" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Giải thích tại sao đáp án đúng..." rows={3} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingQuestion ? 'Cập nhật' : 'Thêm câu hỏi'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && <ConfirmDialog title="Xóa câu hỏi" message="Bạn có chắc muốn xóa câu hỏi này?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        deckId={id}
        onSuccess={(count) => {
          toast.success(`Đã import thành công ${count} câu hỏi!`);
          loadData();
        }}
      />
    </>
  );
}
