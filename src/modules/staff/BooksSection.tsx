'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBooksApi, createBookApi, updateBookApi, deleteBookApi, getSubCategoriesApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookTable from '@/components/books/BookTable';
import BookModal from '@/components/books/BookModal';
import Toast from '@/components/ui/Toast';


export default function BooksSection() {
  const [books, setBooks] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedSubCat, setSelectedSubCat] = useState('');
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
        const data = await getSubCategoriesApi();
        setSubCategories(Array.isArray(data) ? data : (data as any)?.items || []);
      } catch { setSubCategories([]); }
    })();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooksApi({
        keyword: searchTerm || undefined,
        sub_category_id: selectedSubCat ? Number(selectedSubCat) : undefined,
        pageSize: 100,
      });
      setBooks((data.items || []).map(mapBook));
    } catch (e: any) { setBooks([]); showToast(e.message || 'Lỗi khi tải danh sách sách', 'error'); }
    setLoading(false);
  }, [searchTerm, selectedSubCat]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const handleAdd = async (payload: any) => {
    setSubmitting(true);
    try {
      await createBookApi(payload);
      showToast('Thêm đầu sách mới thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch (e: any) { showToast(e.message || 'Lỗi khi thêm sách', 'error'); }
    setSubmitting(false);
  };

  const handleUpdate = async (payload: any) => {
    setSubmitting(true);
    try {
      await updateBookApi(bookModal.id, payload);
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
          value={selectedSubCat}
          onChange={(e) => setSelectedSubCat(e.target.value)}
        >
          <option value="">Tất cả thể loại</option>
          {subCategories.map((sc: any) => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
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