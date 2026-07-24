'use client';

import { useState } from 'react';

export default function ReturnModal({
  open, loan, onReturnDetail, onCancel, loading,
}: {
  open: boolean;
  loan: any;
  onReturnDetail: (detailId: string, returnQty: number, lostQty: number, note?: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [returnMap, setReturnMap] = useState<Record<string, number>>({});
  const [lostMap, setLostMap] = useState<Record<string, number>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  if (!open || !loan) return null;

  const pendingDetails = (loan.details || []).filter(
    (d: any) => d.status !== 'RETURNED' && d.status !== 'CANCELLED'
  );

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <div>
            <h3>Thu Hồi Sách</h3>
            <p className="modal-subtitle">Độc giả: {loan.userName} — có thể trả từng phần</p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingDetails.map((d: any) => {
                const remaining = d.remainingQuantity ?? d.quantity;
                const returnQty = returnMap[d.id] ?? 0;
                const lostQty = lostMap[d.id] ?? 0;
                const maxReturn = remaining - lostQty;
                const maxLost = remaining - returnQty;

                return (
                  <div key={d.id} style={{
                    padding: 16, borderRadius: 12,
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  }}>
                    {/* Tên sách + trạng thái */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{d.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.author}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hạn: {d.dueDate || '—'}</div>
                    </div>

                    {/* Thông tin số lượng */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Tổng mượn: </span>
                        <strong>{d.quantity}</strong>
                      </div>
                      {d.returnedQuantity > 0 && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Đã trả: </span>
                          <strong style={{ color: 'var(--success)' }}>{d.returnedQuantity}</strong>
                        </div>
                      )}
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Còn lại: </span>
                        <strong style={{ color: 'var(--warning)' }}>{remaining}</strong>
                      </div>
                    </div>

                    {/* Ô nhập: SL trả + SL mất + Ghi chú */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SL trả</label>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(maxReturn, 0)}
                          className="form-control"
                          style={{ width: 70 }}
                          value={returnQty}
                          onChange={(e) =>
                            setReturnMap({ ...returnMap, [d.id]: Math.max(0, Math.min(Math.max(maxReturn, 0), Number(e.target.value))) })
                          }
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SL mất</label>
                        <input
                          type="number"
                          min={0}
                          max={Math.max(maxLost, 0)}
                          className="form-control"
                          style={{ width: 70 }}
                          value={lostQty}
                          onChange={(e) =>
                            setLostMap({ ...lostMap, [d.id]: Math.max(0, Math.min(Math.max(maxLost, 0), Number(e.target.value))) })
                          }
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ghi chú</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tùy chọn..."
                          value={noteMap[d.id] || ''}
                          onChange={(e) => setNoteMap({ ...noteMap, [d.id]: e.target.value })}
                        />
                      </div>
                      <button
                        className="btn btn-success"
                        style={{ padding: '8px 16px', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                        disabled={loading || (returnQty === 0 && lostQty === 0)}
                        onClick={() => onReturnDetail(d.id, returnQty, lostQty, noteMap[d.id])}
                      >
                        {loading ? '...' : `Trả ${returnQty > 0 ? returnQty + ' cuốn' : ''}${lostQty > 0 ? (returnQty > 0 ? ' + ' : '') + 'mất ' + lostQty : ''}`}
                      </button>
                    </div>
                  </div>
                );
              })}
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