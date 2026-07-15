'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBooksApi, createBookApi, updateBookApi, deleteBookApi, getCategoriesApi, getSubCategoriesApi, uploadBookImageApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookTable from '@/components/books/BookTable';
import BookModal from '@/components/books/BookModal';
import Toast from '@/components/ui/Toast';


export default function BooksSection() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookModal, setBookModal] = useState<boolean | any>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCategoriesApi();
        setCategories(Array.isArray(data) ? data : (data as any)?.items || []);
      } catch { setCategories([]); }
    })();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { keyword: searchTerm || undefined, pageSize: 100 };
      if (selectedCatId) {
        const subs = await getSubCategoriesApi(Number(selectedCatId));
        const list = Array.isArray(subs) ? subs : (subs as any)?.items || [];
        if (list.length > 0) params.sub_category_id = Number(list[0].id);
      }
      const data = await getBooksApi(params);
      setBooks((data.items || []).map(mapBook));
    } catch (e: any) { setBooks([]); showToast(e.message || 'Lỗi khi tải danh sách sách', 'error'); }
    setLoading(false);
  }, [searchTerm, selectedCatId]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const handleAdd = async (payload: any) => {
    setSubmitting(true);
    try {
      const { _file, image_url, ...data } = payload;
      const res = await createBookApi(data);
      const newId = res?.createBook?.id;
      if (_file && newId) { await uploadBookImageApi(newId, _file); }
      showToast('Thêm đầu sách mới thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch (e: any) { showToast(e.message || 'Lỗi khi thêm sách', 'error'); }
    setSubmitting(false);
  };

  const handleUpdate = async (payload: any) => {
    setSubmitting(true);
    try {
      const { _file, image_url, ...data } = payload;
      await updateBookApi(bookModal.id, data);
      if (_file) { await uploadBookImageApi(bookModal.id, _file); }
      showToast('Cập nhật thông tin sách thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch (e: any) { showToast(e.message || 'Lỗi khi cập nhật sách', 'error'); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ngừng cho mượn đầu sách này?')) return;
    try {
      await deleteBookApi(id);
      showToast('Đã ngừng cho mượn đầu sách này!', 'success');
      fetchBooks();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xóa sách', 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-control"
          style={{ maxWidth: 320, background: 'var(--bg-secondary)' }}
          placeholder="Tìm kiếm theo tên sách..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-control"
          style={{ maxWidth: 240, background: 'var(--bg-secondary)' }}
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
        >
          <option value="">Tất cả thể loại</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <BookTable
        books={books}
        loading={loading}
        onEdit={(book: any) => setBookModal(book)}
        onDelete={handleDelete}
        onAdd={() => setBookModal(true)}
      />

      <BookModal
        open={!!bookModal}
        book={typeof bookModal === 'object' ? bookModal : null}
        onClose={() => setBookModal(false)}
        onSubmit={typeof bookModal === 'object' ? handleUpdate : handleAdd}
        loading={submitting}
      />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}