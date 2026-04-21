import { useState, useEffect } from 'react';
import { historyApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const { data } = await historyApi.getAll(0, 100);
      setHistories(data.content || []);
    } catch (e) { toast.error('Lỗi tải lịch sử'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await historyApi.delete(deleteTarget.id);
      toast.success('Đã xóa');
      setDeleteTarget(null);
      loadHistory();
    } catch (e) { toast.error('Lỗi khi xóa'); }
  };

  const formatTime = (s) => {
    if (!s) return '--';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (pct) => {
    if (pct >= 90) return 'var(--success)';
    if (pct >= 70) return 'var(--accent-light)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Lịch sử làm bài</h1>
          <p className="subtitle">{histories.length} lần làm bài</p>
        </div>
      </div>

      {histories.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📊</div>
          <p>Chưa có lịch sử. Hãy làm bài test đầu tiên!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bộ đề</th>
                <th>Điểm</th>
                <th>%</th>
                <th>Thời gian</th>
                <th>Ngày làm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {histories.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 500 }}>{h.deckName}</td>
                  <td>{h.score}/{h.totalQuestions}</td>
                  <td>
                    <span style={{ color: getScoreColor(h.percentage), fontWeight: 600 }}>
                      {h.percentage}%
                    </span>
                  </td>
                  <td>{formatTime(h.timeTakenSeconds)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(h.testedAt).toLocaleString('vi-VN')}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => setDeleteTarget(h)} title="Xóa">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog title="Xóa lịch sử" message="Bạn có chắc muốn xóa record lịch sử này?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
