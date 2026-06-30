'use client';

import { useState, useCallback } from 'react';
import { CloseIcon } from '@/components/ui/icons';

export default function BorrowModal({
  book,
  onClose,
  onSubmit,
  members = [],
  showToast,
}: {
  book: { id: string; title: string } | null;
  onClose: () => void;
  onSubmit: (readerName: string, readerId: string) => Promise<void>;
  members?: any[];
  showToast?: (text: string, type: 'success' | 'error') => void;
}) {
  const [readerName, setReaderName] = useState('');
  const [readerId, setReaderId] = useState('');
  const [detectedName, setDetectedName] = useState(false);
  const [detectedId, setDetectedId] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReaderName(val);
    setDetectedName(false);
    setError('');
    if (!val.trim()) return;
    const match = members.find(
      (m) => m.name.toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setReaderId(match.id);
      setDetectedName(true);
    }
  }, [members]);

  const handleIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReaderId(val);
    setDetectedId(false);
    setError('');
    if (!val.trim()) return;
    const match = members.find((m) => m.id === val.trim());
    if (match) {
      setReaderName(match.name);
      setDetectedId(true);
    }
  }, [members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const match = members.find(
      (m) =>
        m.name.toLowerCase() === readerName.trim().toLowerCase() &&
        m.id === readerId.trim()
    );
    if (!match) {
      const errMsg = 'Bạn đã nhập sai tên/mã độc giả hoặc không có tài khoản trên hệ thống';
      setError(errMsg);
      showToast?.(errMsg, 'error');
      return;
    }
    await onSubmit(readerName, readerId);
    setReaderName('');
    setReaderId('');
    setDetectedName(false);
    setDetectedId(false);
    setError('');
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
            <label>Họ và Tên Độc Giả</label>
            <input
              type="text" className="form-control" required
              placeholder="Nhập họ và tên đầy đủ"
              value={readerName}
              onChange={handleNameChange}
              id="borrow-reader-name"
            />
            {detectedName && <small style={{ color: 'var(--success)', marginTop: 4, display: 'block' }}>✓ Đã tự động điền mã độc giả</small>}
          </div>
          <div className="form-group">
            <label>Mã Độc Giả (ID)</label>
            <input
              type="text" className="form-control" required
              placeholder="Nhập mã thẻ độc giả của bạn"
              value={readerId}
              onChange={handleIdChange}
              id="borrow-reader-id"
            />
            {detectedId && <small style={{ color: 'var(--success)', marginTop: 4, display: 'block' }}>✓ Đã tự động điền tên độc giả</small>}
            {error && <small style={{ color: 'var(--error)', marginTop: 4, display: 'block' }}>{error}</small>}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Hủy bỏ</button>
            <button type="submit" className="btn btn-primary" id="submit-borrow">Gửi Yêu Cầu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
