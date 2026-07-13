'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { calculateRentalFee } from '@/utils/mappers';
import { CloseIcon } from '@/components/ui/icons';

const DEFAULT_BORROW_DAYS = 14;

export default function BorrowModal({
  book,
  onClose,
  onSubmit,
  user,
}: {
  book: { id: string; title: string } | null;
  onClose: () => void;
  onSubmit: (quantity: number, borrowDays: number) => Promise<void>;
  user?: { id: number; full_name: string; username?: string } | null;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [borrowDays, setBorrowDays] = useState(DEFAULT_BORROW_DAYS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!book) return;
    setDetail(null);
    setError('');
    setQuantity(1);
    setLoadingDetail(true);
    api<any>(`/books/${book.id}`)
      .then((b) => {
        const available = Math.max((b.total_quantity || 0) - (b.borrowed_quantity || 0), 0);
        const maxDays = b.max_borrow_days || DEFAULT_BORROW_DAYS;
        setDetail({
          available,
          maxBorrowDays: maxDays,
          depositAmount: Number(b.deposit_amount || 0),
          feePerDay: Number(b.fee_per_day || 0),
          feePerWeek: Number(b.fee_per_week || 0),
          feePerMonth: Number(b.fee_per_month || 0),
        });
        setBorrowDays(Math.min(DEFAULT_BORROW_DAYS, maxDays));
      })
      .catch(() => setError('Không tải được thông tin sách'))
      .finally(() => setLoadingDetail(false));
  }, [book]);

  if (!book) return null;

  const rentalFee = detail ? calculateRentalFee(borrowDays, detail.feePerDay, detail.feePerWeek, detail.feePerMonth) * quantity : 0;
  const depositTotal = detail ? detail.depositAmount * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    if (quantity < 1 || quantity > detail.available) {
      setError(`Số lượng phải từ 1 đến ${detail.available}`);
      return;
    }
    if (borrowDays < 1 || borrowDays > detail.maxBorrowDays) {
      setError(`Số ngày mượn phải từ 1 đến ${detail.maxBorrowDays}`);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(quantity, borrowDays);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Đăng Ký Mượn Sách</h3>
            <p className="modal-subtitle">Gửi yêu cầu mượn, thủ thư sẽ xác nhận và bạn thanh toán tại quầy</p>
          </div>
          <button onClick={onClose} className="modal-close" id="close-borrow-modal"><CloseIcon /></button>
        </div>

        {loadingDetail ? (
          <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>Đang tải thông tin sách...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên Sách</label>
              <input type="text" className="form-control" value={book.title} disabled />
            </div>
            <div className="form-group">
              <label>Người mượn</label>
              <input type="text" className="form-control" value={user?.full_name || user?.username || ''} disabled />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Số lượng {detail && `(còn ${detail.available})`}</label>
                <input
                  type="number" className="form-control" min={1} max={detail?.available || 1}
                  value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Số ngày mượn {detail && `(tối đa ${detail.maxBorrowDays})`}</label>
                <input
                  type="number" className="form-control" min={1} max={detail?.maxBorrowDays || DEFAULT_BORROW_DAYS}
                  value={borrowDays} onChange={(e) => setBorrowDays(Number(e.target.value))}
                />
              </div>
            </div>

            {detail && (
              <div className="borrow-fee-preview">
                <div><span>Tiền đặt cọc</span><strong>{depositTotal.toLocaleString('vi-VN')}đ</strong></div>
                <div><span>Phí thuê dự kiến</span><strong>{rentalFee.toLocaleString('vi-VN')}đ</strong></div>
              </div>
            )}

            {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '12px' }}>{error}</p>}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" id="submit-borrow" disabled={submitting || !detail}>
                {submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
