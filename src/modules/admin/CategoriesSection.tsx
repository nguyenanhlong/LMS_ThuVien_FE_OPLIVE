'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi,
  createSubCategoryApi, updateSubCategoryApi, deleteSubCategoryApi
} from '@/lib/api';
import { PERMISSIONS, hasPermission } from '@/utils/permissions';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function CategoriesSection({ permissions, userRole }: { permissions?: string[]; userRole?: string }) {
  const isAdmin = userRole === 'ADMIN';
  const catCreate = isAdmin || hasPermission(permissions, PERMISSIONS.CATEGORY_CREATE);
  const catUpdate = isAdmin || hasPermission(permissions, PERMISSIONS.CATEGORY_UPDATE);
  const catDelete = isAdmin || hasPermission(permissions, PERMISSIONS.CATEGORY_DELETE);
  const subView = isAdmin || hasPermission(permissions, PERMISSIONS.SUB_CATEGORY_VIEW);
  const subCreate = isAdmin || hasPermission(permissions, PERMISSIONS.SUB_CATEGORY_CREATE);
  const subUpdate = isAdmin || hasPermission(permissions, PERMISSIONS.SUB_CATEGORY_UPDATE);
  const subDelete = isAdmin || hasPermission(permissions, PERMISSIONS.SUB_CATEGORY_DELETE);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<{
    type: 'addCat' | 'editCat' | 'addSub' | 'editSub';
    cat?: any;
    sub?: any;
  } | null>(null);
  const [formName, setFormName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'cat' | 'sub'; item: any; catName?: string } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategoriesApi();
      const cats = Array.isArray(data) ? data : [];
      if (!subView) {
        for (const cat of cats) cat.sub_categories = [];
      }
      setCategories(cats);
    } catch { setCategories([]); }
    setLoading(false);
  }, [subView]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openAddCat = () => { setModal({ type: 'addCat' }); setFormName(''); };
  const openEditCat = (cat: any) => { setModal({ type: 'editCat', cat }); setFormName(cat.name); };
  const openAddSub = (cat: any) => { setModal({ type: 'addSub', cat }); setFormName(''); };
  const openEditSub = (sub: any, cat: any) => { setModal({ type: 'editSub', cat, sub }); setFormName(sub.name); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      let ok = true;
      switch (modal?.type) {
        case 'addCat':
          if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            showToast('Tên thể loại đã tồn tại', 'error'); ok = false; break;
          }
          await createCategoryApi(name);
          showToast('Thêm danh mục thành công!', 'success');
          break;
        case 'editCat':
          if (categories.some(c => c.id !== modal.cat.id && c.name.toLowerCase() === name.toLowerCase())) {
            showToast('Tên thể loại đã tồn tại', 'error'); ok = false; break;
          }
          await updateCategoryApi(modal.cat.id, name);
          showToast('Cập nhật danh mục thành công!', 'success');
          break;
        case 'addSub': {
          const subs = modal.cat.sub_categories || [];
          if (subs.some((s: any) => s.name.toLowerCase() === name.toLowerCase())) {
            showToast('Tên thể loại con đã tồn tại trong thể loại này', 'error'); ok = false; break;
          }
          await createSubCategoryApi(modal.cat.id, name);
          showToast('Thêm danh mục con thành công!', 'success');
          break;
        }
        case 'editSub': {
          const parent = categories.find(c =>
            (c.sub_categories || []).some((s: any) => s.id === modal.sub.id)
          );
          const siblings = parent ? (parent.sub_categories || []).filter((s: any) => s.id !== modal.sub.id) : [];
          if (siblings.some((s: any) => s.name.toLowerCase() === name.toLowerCase())) {
            showToast('Tên thể loại con đã tồn tại trong thể loại này', 'error'); ok = false; break;
          }
          await updateSubCategoryApi(modal.sub.id, { name });
          showToast('Cập nhật danh mục con thành công!', 'success');
          break;
        }
      }
      if (ok) { setModal(null); fetchCategories(); }
    } catch (e: any) { showToast(e.message || 'Lỗi', 'error'); }
    setSubmitting(false);
  };

  const handleDeleteCat = async (cat: any) => {
    const count = cat.sub_categories?.length || 0;
    if (count > 0) {
      showToast(`Không thể xoá "${cat.name}" vì còn ${count} danh mục con`, 'error');
      return;
    }
    setDeleteConfirm({ type: 'cat', item: cat });
  };

  const handleDeleteSub = async (sub: any, catName: string) => {
    setDeleteConfirm({ type: 'sub', item: sub, catName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'cat') {
        await deleteCategoryApi(deleteConfirm.item.id);
        showToast('Xoá danh mục thành công!', 'success');
      } else {
        await deleteSubCategoryApi(deleteConfirm.item.id);
        showToast('Xoá danh mục con thành công!', 'success');
      }
      setDeleteConfirm(null);
      fetchCategories();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xoá', 'error'); setDeleteConfirm(null); }
  };

  const catCanEdit = (catUpdate || catDelete || subCreate);
  const subCanEdit = (subUpdate || subDelete);

  return (
    <div>
      <div className="manager-header-actions">
        <h2 className="section-title">Quản Lý Danh Mục</h2>
        {catCreate && <button onClick={openAddCat} className="btn btn-primary">+ Thêm Danh Mục</button>}
      </div>

      {loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : !categories.length ? (
        <div className="empty-state"><p>Chưa có danh mục nào</p></div>
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {categories.map((cat: any, ci: number) => {
            const subs = cat.sub_categories || [];
            const isOpen = expanded.has(cat.id);
            return (
                <div key={cat.id} style={{
                borderBottom: ci < categories.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                {/* Category row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                  cursor: subView ? 'pointer' : 'default', background: isOpen ? 'var(--bg-tertiary)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                  onClick={() => subView && toggleExpand(cat.id)}
                >
                  {subView && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                  {!subView && <div style={{ width: 16, flexShrink: 0 }} />}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                  </svg>
                  <span style={{ fontWeight: 600, flex: 1, fontSize: '0.9375rem' }}>{cat.name}</span>
                  {subView && (
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                      {subs.length} danh mục con
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    {subCreate && subView && <button onClick={() => openAddSub(cat)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>+ Thêm con</button>}
                    {catUpdate && <button onClick={() => openEditCat(cat)} className="btn btn-edit" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>Sửa</button>}
                    {catDelete && <button onClick={() => handleDeleteCat(cat)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>Xoá</button>}
                  </div>
                </div>

                {/* Sub-categories (expandable) */}
                {subView && isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    {subs.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Chưa có danh mục con
                      </div>
                    ) : (
                      subs.map((sub: any, si: number) => (
                        <div key={sub.id} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 20px 10px 52px',
                          borderBottom: si < subs.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                          </svg>
                          <span style={{ flex: 1, fontSize: '0.875rem' }}>{sub.name}</span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {subUpdate && <button onClick={() => openEditSub(sub, cat)} className="btn btn-edit" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Sửa</button>}
                            {subDelete && <button onClick={() => handleDeleteSub(sub, cat.name)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Xoá</button>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />

      <ConfirmDialog
        open={!!deleteConfirm}
        title={deleteConfirm?.type === 'cat' ? 'Xoá danh mục' : 'Xoá danh mục con'}
        message={
          deleteConfirm?.type === 'cat'
            ? `Bạn có chắc muốn xoá danh mục "${deleteConfirm?.item?.name}"?`
            : `Bạn có chắc muốn xoá danh mục con "${deleteConfirm?.item?.name}"?`
        }
        confirmText="Xoá"
        cancelText="Huỷ"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Modal for Add/Edit Category & SubCategory */}
      {modal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">
                {modal.type === 'addCat' ? 'Thêm Danh Mục' :
                 modal.type === 'editCat' ? `Sửa Danh Mục: ${modal.cat.name}` :
                 modal.type === 'addSub' ? `Thêm Danh Mục Con (${modal.cat.name})` :
                 `Sửa Danh Mục Con: ${modal.sub.name}`}
              </h3>
              <button onClick={() => setModal(null)} className="modal-close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{modal.type === 'addSub' || modal.type === 'editSub' ? 'Tên danh mục con' : 'Tên danh mục'}</label>
                <input className="form-control" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nhập tên..." required autoFocus />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !formName.trim()}>
                  {submitting ? 'Đang xử lý...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
