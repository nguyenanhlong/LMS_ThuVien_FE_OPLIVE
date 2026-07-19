'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { createLoanApi } from '@/lib/api';
import { calculateRentalFee } from '@/utils/mappers';
import Toast from '@/components/ui/Toast';

export default function CartSection({ onLoanCreated, onGoToLoans }: { onLoanCreated: () => void; onGoToLoans: () => void }) {
  const { items, removeItem, updateItem, clearSelected } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const selectedItems = items.filter((i) => i.selected);
  const totalDeposit = selectedItems.reduce((sum, i) => sum + i.depositAmount * i.quantity, 0);
  const totalFee = selectedItems.reduce((sum, i) => sum + calculateRentalFee(i.borrowDays, i.feePerDay, i.feePerWeek, i.feePerMonth) * i.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedItems.length) { showToast('Vui lòng tick chọn ít nhất 1 cuốn sách', 'error'); return; }

    const newErrors: Record<string, string> = {};
    for (const i of selectedItems) {
      if (i.quantity < 1 || i.quantity > i.availableQuantity) newErrors[i.bookId] = `Số lượng phải từ 1 đến ${i.availableQuantity}`;
      else if (i.borrowDays < 1 || i.borrowDays > i.maxBorrowDays) newErrors[i.bookId] = `Số ngày mượn phải từ 1 đến ${i.maxBorrowDays}`;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    try {
      await createLoanApi(selectedItems.map((i) => ({ book_id: parseInt(i.bookId), quantity: i.quantity, borrow_days: i.borrowDays })));
      showToast('Tạo phiếu mượn thành công! Chờ thủ thư xác nhận.', 'success');
      clearSelected();
      onLoanCreated();
      setTimeout(onGoToLoans, 1200);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo phiếu mượn', 'error');
    }
    setSubmitting(false);
  };

  if (!items.length) {
    return (
      <div className="empty-state">
        <p>Giỏ hàng đang trống. Vào "Tra Cứu Sách" và bấm "Thêm Vào Giỏ" để chọn sách muốn mượn.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="cart-list">
        {items.map((item) => (
          <div key={item.bookId} className="cart-item glass-panel">
            <input
              type="checkbox"
              className="cart-item-checkbox"
              checked={item.selected}
              onChange={(e) => updateItem(item.bookId, { selected: e.target.checked })}
            />

            <div className="cart-item-cover">
              {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
            </div>

            <div className="cart-item-info">
              <span className="cart-item-title">{item.title}</span>
              <span className="cart-item-meta">{item.author} · Còn {item.availableQuantity} cuốn · Tối đa {item.maxBorrowDays} ngày</span>
              {errors[item.bookId] && <span className="cart-item-error">{errors[item.bookId]}</span>}
            </div>

            <div className="cart-item-controls">
              <label>
                <span>Số lượng</span>
                <input
                  type="number" min={1} max={item.availableQuantity}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.bookId, { quantity: Number(e.target.value) })}
                />
              </label>
              <label>
                <span>Số ngày mượn</span>
                <input
                  type="number" min={1} max={item.maxBorrowDays}
                  value={item.borrowDays}
                  onChange={(e) => updateItem(item.bookId, { borrowDays: Number(e.target.value) })}
                />
              </label>
            </div>

            <button className="cart-item-remove" onClick={() => removeItem(item.bookId)} aria-label="Xóa khỏi giỏ" title="Xóa khỏi giỏ">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary glass-panel">
        <div className="cart-summary-row"><span>Đã chọn</span><strong>{selectedItems.length}/{items.length} sách</strong></div>
        <div className="cart-summary-row"><span>Tổng tiền đặt cọc</span><strong>{totalDeposit.toLocaleString('vi-VN')}đ</strong></div>
        <div className="cart-summary-row"><span>Tổng phí thuê dự kiến</span><strong>{totalFee.toLocaleString('vi-VN')}đ</strong></div>
        <button
          className="btn btn-primary btn-full"
          disabled={submitting || !selectedItems.length}
          onClick={handleSubmit}
          style={{ marginTop: '12px' }}
        >
          {submitting ? 'Đang tạo phiếu...' : `Tạo Phiếu Mượn (${selectedItems.length} sách)`}
        </button>
      </div>

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
