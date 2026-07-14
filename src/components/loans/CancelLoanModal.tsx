'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';

export default function CancelLoanModal({
  loan,
  onClose,
  onConfirm,
}: {
  loan: { id: string } | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Hủy Phiếu Mượn</h3>
            <p className="modal-subtitle">Vui lòng cho biết lý do bạn muốn hủy phiếu mượn #{loan.id}</p>
          </div>
          <button onClick={onClose} className="modal-close"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lý do hủy</label>
            <textarea
              className="form-control" rows={3} maxLength={500}
              placeholder="Ví dụ: Tôi đổi ý không mượn nữa..."
              value={reason} onChange={(e) => { setReason(e.target.value); setError(''); }}
            />
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '12px' }}>{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Đóng</button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Đang hủy...' : 'Xác Nhận Hủy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
