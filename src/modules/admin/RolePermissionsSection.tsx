'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPermissionsApi, getRolePermissionsByRoleApi, updateRolePermissionsApi, setCachedPermissions } from '@/lib/api';
import Toast from '@/components/ui/Toast';

const ROLES = ['GUEST', 'LIBRARIAN', 'MEMBER'];

const PRIORITY = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

const GUEST_ALLOWED = new Set(['BOOK_VIEW', 'CATEGORY_VIEW', 'SUB_CATEGORY_VIEW']);

export default function RolePermissionsSection() {
  const [selectedRole, setSelectedRole] = useState<string>('LIBRARIAN');
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [originalPerms, setOriginalPerms] = useState<Set<string>>(new Set());
  const [allMeta, setAllMeta] = useState<{ code: string; label: string; group: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    perms: string[];
    added: string[];
    removed: string[];
  } | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    getPermissionsApi()
      .then((data) => setAllMeta(data || []))
      .catch(() => {});
  }, []);

  const fetchPermissions = useCallback(async (role: string) => {
    setLoading(true);
    try {
      const data = await getRolePermissionsByRoleApi(role);
      const perms = new Set((Array.isArray(data) ? data : []).map((p: any) => p.permission));
      setPermissions(perms);
      setOriginalPerms(perms);
    } catch { setPermissions(new Set()); setOriginalPerms(new Set()); }
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

  const getLabel = (code: string) => {
    const meta = allMeta.find(m => m.code === code);
    return meta ? meta.label : code;
  };

  const handleSave = async () => {
    const currentPerms = selectedRole === 'GUEST'
      ? Array.from(permissions).filter(p => GUEST_ALLOWED.has(p))
      : Array.from(permissions);
    const originalArr = selectedRole === 'GUEST'
      ? Array.from(originalPerms).filter(p => GUEST_ALLOWED.has(p))
      : Array.from(originalPerms);

    const currentSet = new Set(currentPerms);
    const originalSet = new Set(originalArr);

    if (currentPerms.length === originalArr.length && currentPerms.every(p => originalSet.has(p))) {
      showToast('Không có quyền nào thay đổi', 'info');
      return;
    }

    const added = currentPerms.filter(p => !originalSet.has(p));
    const removed = originalArr.filter(p => !currentSet.has(p));

    setConfirmData({ perms: currentPerms, added, removed });
  };

  const confirmSave = async () => {
    if (!confirmData) return;
    setSaving(true);
    const { perms } = confirmData;
    setConfirmData(null);
    const trySave = async (): Promise<void> => {
      await updateRolePermissionsApi(selectedRole, perms);
    };
    try {
      await trySave();
      setCachedPermissions(selectedRole, perms);
      setOriginalPerms(new Set(perms));
      showToast(`Cập nhật quyền ${roleLabel(selectedRole)} thành công!`, 'success');
    } catch (e: any) {
      if (e.message?.includes('duplicate key')) {
        try { await new Promise(r => setTimeout(r, 300)); await trySave(); setCachedPermissions(selectedRole, perms); setOriginalPerms(new Set(perms)); showToast(`Cập nhật quyền ${roleLabel(selectedRole)} thành công!`, 'success'); }
        catch { showToast('Lỗi đồng bộ dữ liệu, vui lòng thử lại', 'error'); }
      } else { showToast(e.message || 'Lỗi khi cập nhật', 'error'); }
    }
    setSaving(false);
  };

  const roleLabel = (r: string) => r === 'ADMIN' ? 'Quản Trị' : r === 'LIBRARIAN' ? 'Thủ Thư' : r === 'GUEST' ? 'Khách' : 'Độc Giả';

  const grouped: Record<string, { key: string; label: string }[]> = {};
  for (const meta of allMeta) {
    if (selectedRole === 'GUEST' && !GUEST_ALLOWED.has(meta.code)) continue;
    if (!grouped[meta.group]) grouped[meta.group] = [];
    grouped[meta.group].push({ key: meta.code, label: meta.label });
  }
  for (const group of Object.keys(grouped)) {
    grouped[group].sort((a, b) => {
      const aSuffix = a.key.includes('_') ? a.key.substring(a.key.indexOf('_') + 1) : '';
      const bSuffix = b.key.includes('_') ? b.key.substring(b.key.indexOf('_') + 1) : '';
      const ai = PRIORITY.indexOf(aSuffix);
      const bi = PRIORITY.indexOf(bSuffix);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
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
            {roleLabel(role)}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 24 }}>
        {loading ? (
          <div className="empty-state"><p>Đang tải...</p></div>
        ) : (
          <>
            {Object.entries(grouped).map(([group, perms]) => (
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

      {confirmData && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setConfirmData(null); }}>
          <div className="modal-content glass-panel" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận cập nhật</h3>
              <button onClick={() => setConfirmData(null)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <p style={{ fontSize: '0.9375rem', textAlign: 'center', padding: '12px 0 8px' }}>
              Cập nhật quyền cho <strong>{roleLabel(selectedRole)}</strong>?
            </p>
            {(confirmData.added.length > 0 || confirmData.removed.length > 0) && (
              <div style={{ padding: '0 16px 12px', fontSize: '0.875rem' }}>
                {confirmData.added.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}>Thêm quyền:</div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {confirmData.added.map(p => (
                        <li key={p} style={{ color: 'var(--success)' }}>{getLabel(p)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {confirmData.removed.length > 0 && (
                  <div>
                    <div style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 4 }}>Bỏ quyền:</div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {confirmData.removed.map(p => (
                        <li key={p} style={{ color: 'var(--error)' }}>{getLabel(p)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button onClick={() => setConfirmData(null)} className="btn btn-secondary">Huỷ</button>
              <button onClick={confirmSave} className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}