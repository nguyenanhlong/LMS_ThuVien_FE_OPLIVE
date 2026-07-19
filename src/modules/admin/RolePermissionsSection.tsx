'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRolePermissionsByRoleApi, updateRolePermissionsApi } from '@/lib/api';
import Toast from '@/components/ui/Toast';

const ROLES = ['ADMIN', 'LIBRARIAN', 'MEMBER'];

const PERMISSION_GROUPS: Record<string, { key: string; label: string }[]> = {
  Sách: [
    { key: 'BOOK_VIEW', label: 'Xem sách' },
    { key: 'BOOK_CREATE', label: 'Thêm sách' },
    { key: 'BOOK_UPDATE', label: 'Sửa sách' },
    { key: 'BOOK_DELETE', label: 'Xoá sách' },
  ],
  'Độc giả': [
    { key: 'USER_VIEW', label: 'Xem độc giả' },
    { key: 'USER_UPDATE_ROLE', label: 'Đổi vai trò' },
  ],
  'Mượn trả': [
    { key: 'LOAN_VIEW', label: 'Xem phiếu mượn' },
    { key: 'LOAN_CREATE', label: 'Tạo phiếu mượn' },
    { key: 'LOAN_CONFIRM', label: 'Xác nhận' },
    { key: 'LOAN_BORROWING', label: 'Cho mượn' },
    { key: 'LOAN_DETAIL_RETURN', label: 'Nhận trả' },
    { key: 'LOAN_CANCEL', label: 'Huỷ phiếu' },
  ],
  'Danh mục': [
    { key: 'CATEGORY_VIEW', label: 'Xem danh mục' },
    { key: 'CATEGORY_CREATE', label: 'Thêm danh mục' },
    { key: 'CATEGORY_UPDATE', label: 'Sửa danh mục' },
    { key: 'CATEGORY_DELETE', label: 'Xoá danh mục' },
  ],
  'Danh mục con': [
    { key: 'SUB_CATEGORY_VIEW', label: 'Xem danh mục con' },
    { key: 'SUB_CATEGORY_CREATE', label: 'Thêm danh mục con' },
    { key: 'SUB_CATEGORY_UPDATE', label: 'Sửa danh mục con' },
    { key: 'SUB_CATEGORY_DELETE', label: 'Xoá danh mục con' },
  ],
  'Phân quyền': [
    { key: 'PERMISSION_MANAGE', label: 'Quản lý phân quyền' },
  ],
};

export default function RolePermissionsSection() {
  const [selectedRole, setSelectedRole] = useState<string>('LIBRARIAN');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchPermissions = useCallback(async (role: string) => {
    setLoading(true);
    try {
      const data = await getRolePermissionsByRoleApi(role);
      setPermissions(new Set((Array.isArray(data) ? data : []).map((p: any) => p.permission)));
    } catch { setPermissions(new Set()); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPermissions(selectedRole); }, [selectedRole, fetchPermissions]);

  const toggle = (perm: string) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm); else next.add(perm);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const trySave = async (): Promise<void> => {
      await updateRolePermissionsApi(selectedRole, Array.from(permissions));
    };
    try {
      await trySave();
      showToast('Cập nhật phân quyền thành công!', 'success');
    } catch (e: any) {
      if (e.message?.includes('duplicate key')) {
        try { await new Promise(r => setTimeout(r, 300)); await trySave(); showToast('Cập nhật phân quyền thành công!', 'success'); }
        catch { showToast('Lỗi đồng bộ dữ liệu, vui lòng thử lại', 'error'); }
      } else { showToast(e.message || 'Lỗi khi cập nhật', 'error'); }
    }
    setSaving(false);
  };

  return (
    <div>
      <h2 className="section-title">Phân Quyền Theo Vai Trò</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`btn ${selectedRole === role ? 'btn-primary' : 'btn-secondary'}`}
          >
            {role === 'ADMIN' ? 'Quản Trị' : role === 'LIBRARIAN' ? 'Thủ Thư' : 'Độc Giả'}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 24 }}>
        {loading ? (
          <div className="empty-state"><p>Đang tải...</p></div>
        ) : (
          <>
            {Object.entries(PERMISSION_GROUPS).map(([group, perms]) => (
              <div key={group} style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{group}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {perms.map((p) => (
                    <label
                      key={p.key}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        borderRadius: 6, cursor: 'pointer', fontSize: '0.8125rem',
                        background: permissions.has(p.key) ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: permissions.has(p.key) ? '#fff' : 'var(--text-primary)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input type="checkbox" checked={permissions.has(p.key)} onChange={() => toggle(p.key)} style={{ accentColor: 'var(--primary)' }} />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </>
        )}
      </div>

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
