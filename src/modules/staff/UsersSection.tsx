'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import UserEditModal from '@/components/users/UserEditModal';
import Toast from '@/components/ui/Toast';

export default function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<any[]>('/users');
      setUsers(data || []);
    } catch { setUsers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = async (data: any) => {
    try {
      await api(`/users/${editUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      showToast('Cập nhật thông tin độc giả thành công!', 'success');
      setEditUser(null);
      fetchUsers();
    } catch { showToast('Lỗi khi cập nhật', 'error'); }
  };

  return (
    <div>
      <div className="manager-header-actions">
        <h2 className="section-title">Danh Sách Độc Giả</h2>
      </div>
      {loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : !users.length ? (
        <div className="empty-state"><p>Chưa có độc giả nào</p></div>
      ) : (
        <div className="table-wrapper glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Username</th>
                <th>Vai Trò</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td><span style={{ fontWeight: 600 }}>{u.full_name}</span></td>
                  <td>{u.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.username}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'LIBRARIAN' ? 'badge-warning' : 'badge-success'}`}>
                      {u.role === 'ADMIN' ? 'Quản Trị' : u.role === 'LIBRARIAN' ? 'Thủ Thư' : 'Độc Giả'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setEditUser(u)} className="btn btn-edit" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editUser && (
        <UserEditModal user={editUser} onClose={() => setEditUser(null)} onUpdate={handleUpdate} />
      )}
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
