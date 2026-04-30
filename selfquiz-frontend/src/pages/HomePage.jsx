import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subjectApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadSubjects(); }, []);

  const loadSubjects = async () => {
    try {
      const { data } = await subjectApi.getAll();
      setSubjects(data);
    } catch (e) {
      toast.error('Lỗi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingSubject(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (e, subject) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject(subject);
    setForm({ name: subject.name, description: subject.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Tên môn học không được trống');
    try {
      if (editingSubject) {
        await subjectApi.update(editingSubject.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await subjectApi.create(form);
        toast.success('Tạo môn học thành công');
      }
      setShowModal(false);
      loadSubjects();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    try {
      await subjectApi.delete(deleteTarget.id);
      toast.success('Đã xóa môn học');
      setDeleteTarget(null);
      loadSubjects();
    } catch (e) {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Môn học</h1>
          <p className="subtitle">{subjects.length} môn học</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Thêm môn học</button>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📚</div>
          <p>Chưa có môn học nào. Bấm "Thêm môn học" để bắt đầu!</p>
        </div>
      ) : (
        <div className="card-grid">
          {subjects.map((s) => (
            <Link to={`/subjects/${s.id}`} key={s.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-actions">
                {s.sample || s.isSample ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-light)', background: 'rgba(108, 92, 231, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>MẪU</span>
                ) : (
                  <>
                    <button className="btn-icon" onClick={(e) => openEdit(e, s)} title="Sửa">✏️</button>
                    <button className="btn-icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(s); }} title="Xóa">🗑️</button>
                  </>
                )}
              </div>
              <div className="card-title">{s.name}</div>
              {s.description && <div className="card-desc">{s.description}</div>}
              <div className="card-meta">
                <span className="card-badge">{s.deckCount} bộ đề</span>
                <span>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSubject ? 'Sửa môn học' : 'Thêm môn học'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Tên môn học *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Software Architecture" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn gọn..." rows={3} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingSubject ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa môn học"
          message={`Bạn có chắc muốn xóa <strong>${deleteTarget.name}</strong>? Tất cả bộ đề và câu hỏi liên quan sẽ bị ẩn.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
