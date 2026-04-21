import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { subjectApi, deckApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [subRes, deckRes] = await Promise.all([
        subjectApi.getById(id),
        deckApi.getBySubject(id),
      ]);
      setSubject(subRes.data);
      setDecks(deckRes.data);
    } catch (e) {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingDeck(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (e, deck) => {
    e.preventDefault(); e.stopPropagation();
    setEditingDeck(deck);
    setForm({ name: deck.name, description: deck.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Tên bộ đề không được trống');
    try {
      if (editingDeck) {
        await deckApi.update(editingDeck.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await deckApi.create(id, form);
        toast.success('Tạo bộ đề thành công');
      }
      setShowModal(false);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    try {
      await deckApi.delete(deleteTarget.id);
      toast.success('Đã xóa bộ đề');
      setDeleteTarget(null);
      loadData();
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Môn học</Link>
        <span className="sep">›</span>
        <span>{subject?.name}</span>
      </div>

      <div className="page-header">
        <div>
          <h1>{subject?.name}</h1>
          {subject?.description && <p className="subtitle">{subject.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm bộ đề</button>
      </div>

      {decks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📂</div>
          <p>Chưa có bộ đề nào. Bấm "Thêm bộ đề" để bắt đầu!</p>
        </div>
      ) : (
        <div className="card-grid">
          {decks.map((d) => (
            <Link to={`/decks/${d.id}`} key={d.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-actions">
                <button className="btn-icon" onClick={(e) => openEdit(e, d)} title="Sửa">✏️</button>
                <button className="btn-icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(d); }} title="Xóa">🗑️</button>
              </div>
              <div className="card-title">{d.name}</div>
              {d.description && <div className="card-desc">{d.description}</div>}
              <div className="card-meta">
                <span className="card-badge">{d.questionCount} câu hỏi</span>
                <span>{new Date(d.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/test/config/${d.id}`} className={`btn btn-primary btn-sm ${d.questionCount === 0 ? '' : ''}`}
                  onClick={(e) => { if (d.questionCount === 0) { e.preventDefault(); e.stopPropagation(); toast.error('Bộ đề chưa có câu hỏi'); } else { e.stopPropagation(); } }}
                  style={d.questionCount === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                  🎯 Làm bài
                </Link>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDeck ? 'Sửa bộ đề' : 'Thêm bộ đề'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Tên bộ đề *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Chapter 1, Mid-term Review" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn..." rows={3} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{editingDeck ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Xóa bộ đề" message={`Xóa <strong>${deleteTarget.name}</strong> và tất cả câu hỏi bên trong?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
