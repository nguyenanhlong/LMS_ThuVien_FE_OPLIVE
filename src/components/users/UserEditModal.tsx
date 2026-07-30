'use client';

import { useState } from 'react';

export default function UserEditModal({ user, onClose, onUpdate, canEditRole, canEditStatus }: any) {
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(String(user.is_active));
  const [banReason, setBanReason] = useState(user.banned_reason || '');
  const isBanning = isActive === 'false';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanning && (!banReason || banReason.trim().length < 5)) return;
    const payload: any = {};
    if (canEditRole) payload.role = role;
    if (canEditStatus) {
      payload.is_active = isActive === 'true';
      if (isBanning) payload.banned_reason = banReason.trim();
    }
    onUpdate(payload);
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
          {canEditRole !== false && (
            <div className="form-group">
              <label>Vai trò</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
                <option value="MEMBER">Độc Giả</option>
                <option value="LIBRARIAN">Thủ Thư</option>
                <option value="ADMIN">Quản Trị</option>
              </select>
            </div>
          )}
          {canEditStatus !== false && (
            <>
              <div className="form-group">
                <label>Trạng thái</label>
                <select className="form-control" value={isActive} onChange={(e) => { setIsActive(e.target.value); if (e.target.value === 'true') setBanReason(''); }} style={{ background: 'var(--bg-tertiary)' }}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Vô hiệu</option>
                </select>
              </div>
              {isBanning && (
                <div className="form-group">
                  <label>Lý do khóa</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập lý do khóa tài khoản (tối thiểu 5 ký tự)"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    style={{ background: 'var(--bg-tertiary)', resize: 'vertical' }}
                  />
                  {banReason && banReason.trim().length < 5 && (
                    <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: 4 }}>Lý do phải có ít nhất 5 ký tự</p>
                  )}
                </div>
              )}
            </>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={isBanning && (!banReason || banReason.trim().length < 5)}>Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
}
