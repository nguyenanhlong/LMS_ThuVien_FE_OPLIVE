'use client';

import { useState } from 'react';

export default function ReturnModal({
  open, loan, onReturnDetail, onCancel, loading,
}: {
  open: boolean;
  loan: any;
  onReturnDetail: (detailId: string, lostQty: number) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [lostMap, setLostMap] = useState<Record<string, number>>({});

  if (!open || !loan) return null;

  const pendingDetails = (loan.details || []).filter(
    (d: any) => d.status !== 'RETURNED' && d.status !== 'CANCELLED'
  );

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Thu Hồi Sách</h3>
            <p className="modal-subtitle">Độc giả: {loan.userName} — trả từng đầu sách</p>
          </div>
          <button className="modal-close" onClick={onCancel} type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {pendingDetails.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Tất cả sách trong phiếu này đã được trả.</p>
          ) : (
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>SL mượn</th>
                    <th>Hạn trả</th>
                    <th>SL mất</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDetails.map((d: any) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.title}</td>
                      <td>{d.quantity}</td>
                      <td>{d.dueDate || '—'}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={d.quantity}
                          className="form-control"
                          style={{ width: 70 }}
                          value={lostMap[d.id] ?? 0}
                          onChange={(e) =>
                            setLostMap({ ...lostMap, [d.id]: Math.max(0, Math.min(d.quantity, Number(e.target.value))) })
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                          disabled={loading}
                          onClick={() => onReturnDetail(d.id, lostMap[d.id] ?? 0)}
                        >
                          {loading ? '...' : 'Xác nhận trả'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-actions">
            <button onClick={onCancel} className="btn btn-secondary" type="button">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}