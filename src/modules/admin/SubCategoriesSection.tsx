'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategoriesApi, getSubCategoriesApi, createSubCategoryApi, updateSubCategoryApi, deleteSubCategoryApi } from '@/lib/api';
import Toast from '@/components/ui/Toast';

export default function SubCategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ type: 'add' | 'edit'; data?: any } | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    (async () => {
      try { const data = await getCategoriesApi(); setCategories(Array.isArray(data) ? data : []); }
      catch { setCategories([]); }
    })();
  }, []);

  const fetchSubs = useCallback(async () => {
    if (!selectedCat) { setSubCategories([]); return; }
    setLoading(true);
    try {
      const data = await getSubCategoriesApi(Number(selectedCat));
      setSubCategories(Array.isArray(data) ? data : []);
    } catch { setSubCategories([]); }
    setLoading(false);
  }, [selectedCat]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const openAdd = () => { setModal({ type: 'add' }); setName(''); setCategoryId(selectedCat); };
  const openEdit = (sc: any) => { setModal({ type: 'edit', data: sc }); setName(sc.name); setCategoryId(String(sc.category_id)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    setSubmitting(true);
    try {
      if (modal?.type === 'add') {
        await createSubCategoryApi(Number(categoryId), name.trim());
        showToast('Thêm danh mục con thành công!', 'success');
      } else if (modal?.type === 'edit' && modal.data) {
        await updateSubCategoryApi(modal.data.id, { name: name.trim() });
        showToast('Cập nhật danh mục con thành công!', 'success');
      }
      setModal(null);
      fetchSubs();
    } catch (e: any) { showToast(e.message || 'Lỗi', 'error'); }
    setSubmitting(false);
  };

  const handleDelete = async (sc: any) => {
    if (!window.confirm(`Xoá danh mục con "${sc.name}"?`)) return;
    try {
      await deleteSubCategoryApi(sc.id);
      showToast('Xoá danh mục con thành công!', 'success');
      fetchSubs();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xoá', 'error'); }
  };

  return (
    <div>
      <div className="manager-header-actions">
        <h2 className="section-title">Danh Sách Danh Mục Con</h2>
        {selectedCat && <button onClick={openAdd} className="btn btn-primary">+ Thêm Danh Mục Con</button>}
      </div>

      <div style={{ marginBottom: 24 }}>
        <select className="form-control" style={{ maxWidth: 360, background: 'var(--bg-secondary)' }} value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!selectedCat ? (
        <div className="empty-state"><p>Vui lòng chọn danh mục</p></div>
      ) : loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : !subCategories.length ? (
        <div className="empty-state"><p>Chưa có danh mục con nào</p></div>
      ) : (
        <div className="table-wrapper glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Danh Mục Con</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {subCategories.map((sc: any) => (
                <tr key={sc.id}>
                  <td>{sc.id}</td>
                  <td><span style={{ fontWeight: 600 }}>{sc.name}</span></td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(sc)} className="btn btn-edit">Sửa</button>
                    <button onClick={() => handleDelete(sc)} className="btn btn-danger">Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">{modal.type === 'add' ? 'Thêm Danh Mục Con' : 'Sửa Danh Mục Con'}</h3>
              <button onClick={() => setModal(null)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {modal.type === 'add' && (
                <div className="form-group">
                  <label>Danh mục cha</label>
                  <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">-- Chọn --</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Tên danh mục con</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên..." required />
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
    </div>
  );
}
