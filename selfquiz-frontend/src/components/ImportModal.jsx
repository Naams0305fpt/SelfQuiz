import React, { useState, useRef } from 'react';
import { importApi } from '../services/api';
import toast from 'react-hot-toast';

const ImportModal = ({ isOpen, onClose, deckId, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetState = () => {
    setRawText('');
    setSelectedFile(null);
    setPreviewData(null);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewData(null);
      setError(null);
    }
  };

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      let res;
      if (activeTab === 'text') {
        if (!rawText.trim()) throw new Error('Vui lòng nhập nội dung văn bản.');
        res = await importApi.previewText(deckId, rawText);
      } else {
        if (!selectedFile) throw new Error('Vui lòng chọn file Excel.');
        res = await importApi.previewExcel(deckId, selectedFile);
      }
      setPreviewData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đọc dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || !previewData.canImport) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const validQuestions = previewData.parsedQuestions
        .filter(q => q.valid && q.question != null)
        .map(q => q.question);
        
      await importApi.commit(deckId, validQuestions);
      onSuccess(validQuestions.length);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu vào hệ thống.');
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h2>📥 Nhập Câu Hỏi Hàng Loạt</h2>
          <button className="btn-icon" onClick={handleClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => { setActiveTab('text'); setPreviewData(null); }}
            style={{ 
              background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem',
              fontWeight: 600, color: activeTab === 'text' ? 'var(--accent-light)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'text' ? '2px solid var(--accent-light)' : '2px solid transparent'
            }}
          >
            Nhập từ Text (Aiken)
          </button>
          <button 
            onClick={() => { setActiveTab('excel'); setPreviewData(null); }}
            style={{ 
              background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1rem',
              fontWeight: 600, color: activeTab === 'excel' ? 'var(--accent-light)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'excel' ? '2px solid var(--accent-light)' : '2px solid transparent'
            }}
          >
            Upload File Excel (.xlsx)
          </button>
        </div>

        {!previewData ? (
          <div>
            {activeTab === 'text' && (
              <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Quy tắc định dạng:</strong><br/>
                  - Dòng 1: Câu hỏi.<br/>
                  - Các dòng tiếp theo: A. Đáp án, B. Đáp án...<br/>
                  - Dòng đáp án đúng: ANSWER: A (hoặc A, B nếu có nhiều đáp án).<br/>
                  - Dòng giải thích: EXPLANATION: Nội dung giải thích.<br/>
                  - Cách nhau 1 dòng trống giữa 2 câu hỏi.
                </div>
                <textarea 
                  className="form-textarea"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Thủ đô của Việt Nam là gì?\nA. Hà Nội\nB. Đà Nẵng\nC. TP.HCM\nANSWER: A"
                  style={{ height: '250px', fontFamily: 'monospace' }}
                />
              </div>
            )}

            {activeTab === 'excel' && (
              <div style={{ 
                border: '2px dashed var(--border)', borderRadius: '12px', padding: '3rem 2rem', 
                textAlign: 'center', background: 'var(--bg-input)'
              }}>
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  📂 Chọn File Excel
                  <input type="file" style={{ display: 'none' }} accept=".xlsx" ref={fileInputRef} onChange={handleFileChange} />
                </label>
                {selectedFile && <p style={{ marginTop: '1rem', color: 'var(--success)' }}>Đã chọn: {selectedFile.name}</p>}
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Định dạng Cột: A (Câu hỏi), B-F (Các đáp án), G (Đáp án đúng VD: A,C), H (Giải thích)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-input)', borderRadius: '8px' }}>
              <div>
                <strong>Tổng cộng: {previewData.totalQuestions} câu</strong>
                <div style={{ color: 'var(--success)', marginTop: '0.25rem' }}>✅ Hợp lệ: {previewData.validQuestions}</div>
                <div style={{ color: 'var(--danger)', marginTop: '0.25rem' }}>❌ Lỗi: {previewData.invalidQuestions}</div>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Trạng thái</th>
                    <th>Nội dung câu hỏi</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.parsedQuestions.map((q, idx) => (
                    <tr key={idx} style={{ background: q.valid ? 'transparent' : 'var(--danger-bg)' }}>
                      <td>{q.index}</td>
                      <td>
                        {q.valid ? <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>OK</span> 
                                   : <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Lỗi</span>}
                      </td>
                      <td>
                        <div style={{ marginBottom: '0.25rem' }}>{q.question ? q.question.content : 'Không đọc được'}</div>
                        {!q.valid && q.errorMessages && (
                          <ul style={{ color: 'var(--danger)', fontSize: '0.85rem', paddingLeft: '1rem' }}>
                            {q.errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={previewData ? () => setPreviewData(null) : handleClose}
            disabled={isLoading}
          >
            {previewData ? 'Quay lại' : 'Hủy'}
          </button>
          
          {!previewData ? (
            <button 
              className="btn btn-primary" 
              onClick={handlePreview}
              disabled={isLoading || (activeTab === 'text' ? !rawText.trim() : !selectedFile)}
            >
              {isLoading ? 'Đang đọc...' : 'Kiểm tra dữ liệu'}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleCommit}
              disabled={isLoading || !previewData.canImport}
              style={{ background: previewData.canImport ? 'var(--success)' : 'var(--border)', color: previewData.canImport ? '#fff' : 'var(--text-muted)' }}
            >
              {isLoading ? 'Đang lưu...' : `Lưu ${previewData.validQuestions} câu hỏi`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
