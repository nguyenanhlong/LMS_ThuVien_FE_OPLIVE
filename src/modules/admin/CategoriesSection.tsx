'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '@/lib/api';
import Toast from '@/components/ui/Toast';
import Pagination from '@/components/ui/Pagination';

export default function CategoriesSection({ permissions, userRole }: { permissions?: string[]; userRole?: string }) {
  const isAdmin = userRole === 'ADMIN';
  const perms = permissions || [];
  const canCreate = isAdmin || perms.includes('CATEGORY_CREATE');
  const canUpdate = isAdmin || perms.includes('CATEGORY_UPDATE');
  const canDelete = isAdmin || perms.includes('CATEGORY_DELETE');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; data?: any } | null>(null);
  const [detailModal, setDetailModal] = useState<any>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategoriesApi();
      setCategories(Array.isArray(data) ? data : []);
      setPage(1);
    } catch { setCategories([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => { setModal({ type: 'add' }); setName(''); };
  const openEdit = (cat: any) => { setModal({ type: 'edit', data: cat }); setName(cat.name); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (modal?.type === 'add') {
        await createCategoryApi(name.trim());
        showToast('Thêm danh mục thành công!', 'success');
      } else if (modal?.type === 'edit' && modal.data) {
        await updateCategoryApi(modal.data.id, name.trim());
        showToast('Cập nhật danh mục thành công!', 'success');
      }
      setModal(null);
      fetchCategories();
    } catch (e: any) { showToast(e.message || 'Lỗi', 'error'); }
    setSubmitting(false);
  };

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const paginatedCategories = categories.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (cat: any) => {
    const count = cat.sub_categories?.length || 0;
    if (count > 0) {
      showToast(`Không thể xoá "${cat.name}" vì còn ${count} danh mục con`, 'error');
      return;
    }
    if (!window.confirm(`Xoá danh mục "${cat.name}"?`)) return;
    try {
      await deleteCategoryApi(cat.id);
      showToast('Xoá danh mục thành công!', 'success');
      fetchCategories();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xoá', 'error'); }
  };

  return (
    <div>
      <div className="manager-header-actions">
        <h2 className="section-title">Danh Sách Danh Mục</h2>
        {canCreate && <button onClick={openAdd} className="btn btn-primary">+ Thêm Danh Mục</button>}
      </div>

      {loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : !categories.length ? (
        <div className="empty-state"><p>Chưa có danh mục nào</p></div>
      ) : (
        <div className="table-wrapper glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Danh Mục</th>
                <th>Số Danh Mục Con</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((cat: any) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td><span style={{ fontWeight: 600 }}>{cat.name}</span></td>
                  <td><span className="badge badge-info">{cat.sub_categories?.length || 0}</span></td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDetailModal(cat)} className="btn btn-secondary">Xem Chi Tiết</button>
                    {canUpdate && <button onClick={() => openEdit(cat)} className="btn btn-edit">Sửa</button>}
                    {canDelete && <button onClick={() => handleDelete(cat)} className="btn btn-danger">Xoá</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}

      {modal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">{modal.type === 'add' ? 'Thêm Danh Mục' : 'Sửa Danh Mục'}</h3>
              <button onClick={() => setModal(null)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên danh mục</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên danh mục..." required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
                  {submitting ? 'Đang xử lý...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />

      {detailModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDetailModal(null); }}>
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">{detailModal.name}</h3>
              <button onClick={() => setDetailModal(null)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <div style={{ padding: '8px 0', maxHeight: '400px', overflowY: 'auto' }}>
              {detailModal.sub_categories?.length > 0 ? (
                detailModal.sub_categories.map((sc: any) => (
                  <div key={sc.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                    <span style={{ fontWeight: 500 }}>{sc.name}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: '32px 0' }}>
                  <p>Không có danh mục con nào</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setDetailModal(null)} className="btn btn-secondary">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
