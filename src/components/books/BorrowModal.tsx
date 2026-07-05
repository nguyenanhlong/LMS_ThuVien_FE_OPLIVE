'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from '@/components/ui/icons';

export default function BorrowModal({
  book,
  onClose,
  onSubmit,
  user,
}: {
  book: { id: string; title: string } | null;
  onClose: () => void;
  onSubmit: (readerName: string, readerId: string) => Promise<void>;
  user?: { id: number; full_name: string } | null;
}) {
  const [readerName, setReaderName] = useState('');
  const [readerId, setReaderId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (book && user) {
      setReaderName(user.full_name || '');
      setReaderId(String(user.id));
    }
  }, [book, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readerName.trim() || !readerId.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setError('');
    await onSubmit(readerName, readerId);
    setReaderName('');
    setReaderId('');
  };

  if (!book) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Đăng Ký Mượn Sách</h3>
            <p className="modal-subtitle">Điền thông tin để gửi yêu cầu mượn</p>
          </div>
          <button onClick={onClose} className="modal-close" id="close-borrow-modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Sách Chọn Mượn</label>
            <input type="text" className="form-control" value={book.title} disabled />
          </div>
          <div className="form-group">
            <label>Mã Độc Giả (ID)</label>
            <input type="number" className="form-control" required placeholder="Nhập mã độc giả" value={readerId} onChange={(e) => { setReaderId(e.target.value); setError(''); }} id="borrow-reader-id" />
          </div>
          <div className="form-group">
            <label>Họ và Tên Độc Giả</label>
            <input type="text" className="form-control" required placeholder="Nhập họ và tên" value={readerName} onChange={(e) => { setReaderName(e.target.value); setError(''); }} id="borrow-reader-name" />
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '12px' }}>{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Hủy bỏ</button>
            <button type="submit" className="btn btn-primary" id="submit-borrow">Gửi Yêu Cầu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
