'use client';

export default function UserEditModal({ user, onClose, onUpdate }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    onUpdate({ role: fd.get('role'), is_active: fd.get('is_active') === 'true' });
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
            <select name="role" className="form-control" defaultValue={user.role} style={{ background: 'var(--bg-tertiary)' }}>
              <option value="MEMBER">Độc Giả</option>
              <option value="LIBRARIAN">Thủ Thư</option>
              <option value="ADMIN">Quản Trị</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select name="is_active" className="form-control" defaultValue={String(user.is_active)} style={{ background: 'var(--bg-tertiary)' }}>
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
