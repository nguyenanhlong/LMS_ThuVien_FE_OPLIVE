'use client';

import Badge from '@/components/ui/Badge';
import { LOAN_STATUS_MAP } from './LoanTable';

const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const DETAIL_STATUS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xử lý', variant: 'info' },
  BORROWING: { label: 'Đang mượn', variant: 'success' },
  OVERDUE: { label: 'Quá hạn', variant: 'danger' },
  RETURNED: { label: 'Đã trả', variant: 'muted' },
  CANCELLED: { label: 'Đã huỷ', variant: 'muted' },
};

export default function LoanDetailModal({
  loan, onClose, onReturn,
}: {
  loan: any;
  onClose: () => void;
  onReturn?: (loan: any) => void;
}) {
  if (!loan) return null;

  const details = loan.details || [];
  const totalQty = details.reduce((s: number, d: any) => s + d.quantity, 0);
  const returnedQty = details.reduce((s: number, d: any) => s + (d.returnedQuantity || 0), 0);
  const lostQty = details.reduce((s: number, d: any) => s + (d.lostQuantity || 0), 0);
  const remainingQty = totalQty - returnedQty - lostQty;

  const loanStatus = LOAN_STATUS_MAP[loan.status] || { label: loan.status, variant: 'muted' };
  const canReturn = loan.status === 'BORROWING' || loan.status === 'OVERDUE';

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Chi Tiết Phiếu Mượn #{loan.id}</h3>
            <p className="modal-subtitle">Độc giả: {loan.userName}</p>
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* Thông tin chung */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Trạng thái</div>
              <Badge variant={loanStatus.variant}>{loanStatus.label}</Badge>
            </div>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-tertiary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Ngày mượn</div>
              <div style={{ fontWeight: 600 }}>{loan.requestDate || '—'}</div>
            </div>
          </div>

          {/* Tổng quan tiến độ trả sách */}
          <div style={{
            padding: 16, borderRadius: 10, marginBottom: 20,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Tiến Độ Trả Sách</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{totalQty}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tổng mượn</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{returnedQty}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đã trả</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--error)' }}>{lostQty}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mất</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)' }}>{remainingQty}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Còn lại</div>
              </div>
            </div>
            {/* Thanh tiến độ */}
            <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', display: 'flex' }}>
              {returnedQty > 0 && (
                <div style={{ width: `${(returnedQty / totalQty) * 100}%`, background: 'var(--success)', transition: 'width 0.3s' }} />
              )}
              {lostQty > 0 && (
                <div style={{ width: `${(lostQty / totalQty) * 100}%`, background: 'var(--error)', transition: 'width 0.3s' }} />
              )}
            </div>
            <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {totalQty > 0 ? `${Math.round(((returnedQty + lostQty) / totalQty) * 100)}% hoàn tất` : ''}
            </div>
          </div>

          {/* Bảng chi tiết từng đầu sách */}
          <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>Danh Sách Đầu Sách ({details.length})</div>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Mượn</th>
                  <th>Đã trả</th>
                  <th>Mất</th>
                  <th>Còn</th>
                  <th>Hạn trả</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d: any) => {
                  const returned = d.returnedQuantity || 0;
                  const lost = d.lostQuantity || 0;
                  const remaining = d.quantity - returned - lost;
                  const ds = DETAIL_STATUS[d.status] || { label: d.status, variant: 'muted' };

                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.author}</div>
                      </td>
                      <td>{d.quantity}</td>
                      <td style={{ color: returned > 0 ? 'var(--success)' : 'var(--text-muted)' }}>{returned}</td>
                      <td style={{ color: lost > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{lost}</td>
                      <td style={{ color: remaining > 0 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: 700 }}>{remaining}</td>
                      <td>{d.dueDate || '—'}</td>
                      <td><Badge variant={ds.variant}>{ds.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Thông tin tài chính */}
          {loan.totalPayment > 0 && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 8 }}>Thanh Toán</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.875rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>Tổng tiền thuê + cọc:</div>
                <div style={{ textAlign: 'right', fontWeight: 600 }}>{fmtMoney(loan.totalPayment)}</div>
                {loan.totalFine > 0 && (
                  <>
                    <div style={{ color: 'var(--error)' }}>Tiền phạt:</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--error)' }}>{fmtMoney(loan.totalFine)}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Lý do huỷ */}
          {loan.cancelledReason && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid var(--error)', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--error)' }}>Lý do huỷ: </span>{loan.cancelledReason}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button onClick={onClose} className="btn btn-secondary" type="button">Đóng</button>
            {canReturn && onReturn && (
              <button onClick={() => onReturn(loan)} className="btn btn-success" type="button">Trả sách</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}