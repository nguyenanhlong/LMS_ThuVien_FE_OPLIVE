'use client';

import { useState } from 'react';

export default function UserEditModal({ user, onClose, onUpdate }: any) {
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(String(user.is_active));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ role, is_active: isActive === 'true' });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Chỉnh Sửa Độc Giả</h3>
            <p className="modal-subtitle">{user.full_name}</p>
          </div>
          <button onClick={onClose} className="modal-close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vai trò</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
              <option value="MEMBER">Độc Giả</option>
              <option value="LIBRARIAN">Thủ Thư</option>
              <option value="ADMIN">Quản Trị</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select className="form-control" value={isActive} onChange={(e) => setIsActive(e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
              <option value="true">Hoạt động</option>
              <option value="false">Vô hiệu</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
