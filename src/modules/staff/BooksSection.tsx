'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookTable from '@/components/books/BookTable';
import BookModal from '@/components/books/BookModal';
import Toast from '@/components/ui/Toast';

const categories = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính'];

export default function BooksSection() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [bookModal, setBookModal] = useState<boolean | any>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<any>(`/books?keyword=${encodeURIComponent(searchTerm)}&pageSize=100`);
      setBooks((data.items || []).map(mapBook));
    } catch { setBooks([]); }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'Tất cả') return books;
    return books.filter((b: any) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const handleAdd = async (data: any) => {
    try {
      await api('/books', {
        method: 'POST',
        body: JSON.stringify({ title: data.title, author: data.author, description: data.description, publisher: data.category, total_quantity: 1 }),
      });
      showToast('Thêm đầu sách mới thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch { showToast('Lỗi khi thêm sách', 'error'); }
  };

  const handleUpdate = async (data: any) => {
    try {
      await api(`/books/${bookModal?.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: data.title, author: data.author, description: data.description, publisher: data.category }),
      });
      showToast('Cập nhật thông tin sách thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch { showToast('Lỗi khi cập nhật sách', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/books/${id}`, { method: 'DELETE' });
      showToast('Xóa sách thành công!', 'success');
      fetchBooks();
    } catch { showToast('Lỗi khi xóa sách', 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ maxWidth: '360px', background: 'var(--bg-secondary)' }} placeholder="Tìm kiếm sách..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`category-pill ${selectedCategory === c ? 'active' : ''}`}>{c}</button>
          ))}
        </div>
      </div>

      <BookTable
        books={filteredBooks} loading={loading}
        onEdit={(book: any) => setBookModal(book)}
        onDelete={handleDelete}
        onAdd={() => setBookModal(true)}
      />

      <BookModal open={!!bookModal} book={typeof bookModal === 'object' ? bookModal : null} onClose={() => setBookModal(false)} onSubmit={typeof bookModal === 'object' ? handleUpdate : handleAdd} />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
