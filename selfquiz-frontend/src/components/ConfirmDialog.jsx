import { useState } from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2>{title || 'Xác nhận'}</h2>
        </div>
        <p className="confirm-text" dangerouslySetInnerHTML={{ __html: message }} />
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Hủy</button>
          <button className="btn btn-danger" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}
