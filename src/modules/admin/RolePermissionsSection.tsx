'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRolePermissionsApi, getRolePermissionsByRoleApi, updateRolePermissionsApi, setCachedPermissions } from '@/lib/api';
import Toast from '@/components/ui/Toast';

const ROLES = ['LIBRARIAN', 'MEMBER'];

const GROUP_LABELS: Record<string, string> = {
  BOOK: 'Sách',
  USER: 'Độc giả',
  LOAN: 'Mượn trả',
  CATEGORY: 'Danh mục',
  SUB_CATEGORY: 'Danh mục con',
  DASHBOARD: 'Dashboard',
};

const PERMISSION_LABELS: Record<string, string> = {
  BOOK_VIEW: 'Xem sách',
  BOOK_CREATE: 'Thêm sách',
  BOOK_UPDATE: 'Sửa sách',
  BOOK_DELETE: 'Xoá sách',
  USER_VIEW: 'Xem độc giả',
  USER_UPDATE_ROLE: 'Đổi vai trò',
  USER_UPDATE_STATUS: 'Khoá/Mở tài khoản',
  LOAN_VIEW: 'Xem phiếu mượn',
  LOAN_CREATE: 'Tạo phiếu mượn',
  LOAN_CONFIRM: 'Xác nhận',
  LOAN_BORROWING: 'Cho mượn',
  LOAN_DETAIL_RETURN: 'Nhận trả',
  LOAN_CANCEL: 'Huỷ phiếu',
  CATEGORY_VIEW: 'Xem danh mục',
  CATEGORY_CREATE: 'Thêm danh mục',
  CATEGORY_UPDATE: 'Sửa danh mục',
  CATEGORY_DELETE: 'Xoá danh mục',
  SUB_CATEGORY_VIEW: 'Xem danh mục con',
  SUB_CATEGORY_CREATE: 'Thêm danh mục con',
  SUB_CATEGORY_UPDATE: 'Sửa danh mục con',
  SUB_CATEGORY_DELETE: 'Xoá danh mục con',
  DASHBOARD_VIEW: 'Xem thống kê',
};

function getGroupKey(permission: string): string {
  const idx = permission.indexOf('_');
  return idx > 0 ? permission.substring(0, idx) : 'OTHER';
}

export default function RolePermissionsSection() {
  const [selectedRole, setSelectedRole] = useState<string>('LIBRARIAN');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    getRolePermissionsApi()
      .then((data) => {
        const unique = Array.from(new Set((Array.isArray(data) ? data : []).map((p: any) => p.permission))).sort() as string[];
        setAllPermissions(unique);
      })
      .catch(() => {});
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
      setCachedPermissions(selectedRole, Array.from(permissions));
      showToast('Cập nhật phân quyền thành công!', 'success');
    } catch (e: any) {
      if (e.message?.includes('duplicate key')) {
        try { await new Promise(r => setTimeout(r, 300)); await trySave(); setCachedPermissions(selectedRole, Array.from(permissions)); showToast('Cập nhật phân quyền thành công!', 'success'); }
        catch { showToast('Lỗi đồng bộ dữ liệu, vui lòng thử lại', 'error'); }
      } else { showToast(e.message || 'Lỗi khi cập nhật', 'error'); }
    }
    setSaving(false);
  };

  const grouped: Record<string, { key: string; label: string }[]> = {};
  for (const perm of allPermissions) {
    const group = getGroupKey(perm);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({ key: perm, label: PERMISSION_LABELS[perm] || perm });
  }

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
            {Object.entries(grouped).map(([groupKey, perms]) => (
              <div key={groupKey} style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {GROUP_LABELS[groupKey] || groupKey}
                </h4>
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