'use client';

export default function ReturnModal({ open, loan, onConfirm, onCancel, loading, isAdmin = false, confirmText = isAdmin ? 'Xác Nhận Thu Hồi' : 'Xác Nhận Trả Sách' }: {
  open: boolean;
  loan: any;
  onConfirm: (id: string) => void;
  onCancel: () => void;
  loading: boolean;
  isAdmin?: boolean;
  confirmText?: string;
}) {
  if (!open || !loan) return null;

  const title = isAdmin ? 'Xác Nhận Thu Hồi Sách' : 'Xác Nhận Trả Sách';
  const subtitle = isAdmin ? 'Xác nhận thu hồi sách từ độc giả' : 'Xác nhận bạn đã trả sách';

  return (
      <div className="modal-backdrop" onClick={onCancel}>
        <div className="modal-content glass-panel">
          <div className="modal-header">
          <div>
            <h3>{title}</h3>
            <p className="modal-subtitle">{subtitle}</p>
          </div>
          <button className="modal-close" onClick={onCancel} type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Độc giả</label>
            <input className="form-control" value={loan.userName || ''} disabled />
          </div>
          <div className="form-group">
            <label>Tên sách</label>
            <input className="form-control" value={loan.book?.title || ''} disabled />
          </div>
          <div className="form-group">
            <label>Hạn trả</label>
            <input className="form-control" value={loan.dueDate || '-'} disabled />
          </div>
          <div className="modal-actions">
            <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Hủy</button>
            <button onClick={() => onConfirm(loan.id)} className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
