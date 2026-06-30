'use client';

import { useState } from 'react';

export default function LoanForm({ onSubmit, onCancel, books, loading }: {
  onSubmit: (data: { memberId: string; memberName: string; bookId: string }) => void;
  onCancel: () => void;
  books: Array<{ id: string; title: string }>;
  loading: boolean;
}) {
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [bookId, setBookId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !memberName || !bookId) return;
    onSubmit({ memberId, memberName, bookId });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Tạo Yêu Cầu Mượn Sách</h3>
            <p className="modal-subtitle">Điền thông tin để gửi yêu cầu mượn</p>
          </div>
          <button onClick={onCancel} className="modal-close" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="loan-member-id">Mã Độc Giả</label>
            <input id="loan-member-id" className="form-control" required placeholder="Nhập mã độc giả" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="loan-member-name">Họ Tên Độc Giả</label>
            <input id="loan-member-name" className="form-control" required placeholder="Nhập họ tên độc giả" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="loan-book">Chọn Sách</label>
            <select id="loan-book" className="form-control" required value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">-- Chọn sách --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !memberId || !memberName || !bookId}>
              {loading ? 'Đang xử lý...' : 'Gửi Yêu Cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
