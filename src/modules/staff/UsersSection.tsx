'use client';

import { useState, useEffect, useCallback } from 'react';
import { graphqlQuery } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import UserEditModal from '@/components/users/UserEditModal';
import Toast from '@/components/ui/Toast';
import Pagination from '@/components/ui/Pagination';

export default function UsersSection({ permissions, userRole }: { permissions?: string[]; userRole?: string }) {
  const isAdmin = userRole === 'ADMIN';
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<any>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const canEditRole = isAdmin || permissions?.includes('USER_UPDATE_ROLE');
  const canEditStatus = isAdmin || permissions?.includes('USER_UPDATE_STATUS');
  const canEdit = canEditRole || canEditStatus;

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const isLib = currentUser?.role === 'LIBRARIAN';
      const res = await graphqlQuery(`
        query GetUsers($query: GetUsersInput) {
          users(query: $query) {
            items {
              id
              username
              email
              full_name
              role
              is_active
              banned_reason
              banned_at
              last_activity_at
            }
            totalPages
          }
        }
      `, { query: { page, pageSize: 7, ...(isLib ? { role: 'MEMBER' } : {}) } });
      setUsers(res.users?.items || []);
      setTotalPages(res.users?.totalPages || 1);
    } catch { setUsers([]); }
    setLoading(false);
  }, [currentUser, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => { setPage(1); }, [currentUser]);

  const handleUpdate = async (data: any) => {
    try {
      if (canEditRole && data.role !== undefined) {
        await graphqlQuery(`
          mutation UpdateUserRole($id: ID!, $input: UpdateUserRoleInput!) {
            updateUserRole(id: $id, input: $input) {
              id
            }
          }
        `, {
          id: editUser.id,
          input: { role: data.role }
        });
      }
      if (canEditStatus && data.is_active !== undefined) {
        await graphqlQuery(`
          mutation UpdateUserStatus($id: ID!, $input: UpdateUserStatusInput!) {
            updateUserStatus(id: $id, input: $input) {
              id
            }
          }
        `, {
          id: editUser.id,
          input: { is_active: data.is_active, ...(data.banned_reason ? { banned_reason: data.banned_reason } : {}) }
        });
      }
      setUsers((prev) => prev.map((u) =>
        u.id === editUser.id ? {
          ...u,
          role: data.role ?? u.role,
          is_active: data.is_active ?? u.is_active,
          banned_reason: data.is_active === false ? (data.banned_reason || u.banned_reason) : null,
          banned_at: data.is_active === false ? new Date().toISOString() : null,
        } : u
      ));
      showToast('Cập nhật thành công!', 'success');
      setEditUser(null);
    } catch (e: any) { showToast(e.message || 'Lỗi khi cập nhật', 'error'); }
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
                <th>Lý Do Khóa</th>
                {canEdit && <th>Hành Động</th>}
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
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: 200 }}>
                    {!u.is_active && u.banned_reason ? (
                      <span title={`Khóa lúc: ${u.banned_at ? new Date(u.banned_at).toLocaleString('vi-VN') : 'N/A'}`}>
                        {u.banned_reason}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  {canEdit && (
                    <td>
                      <button onClick={() => setEditUser(u)} className="btn btn-edit" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                        Sửa
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}

      {editUser && (
        <UserEditModal user={editUser} onClose={() => setEditUser(null)} onUpdate={handleUpdate} canEditRole={canEditRole} canEditStatus={canEditStatus} />
      )}
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
