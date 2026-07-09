'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookCard from '@/components/books/BookCard';
import BorrowModal from '@/components/books/BorrowModal';
import Toast from '@/components/ui/Toast';

const categories = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính'];

export default function BooksSection({ user, onLoanCreated }: any) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [borrowModal, setBorrowModal] = useState<any>(null);
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

  const handleBorrow = async (readerName: string, readerId: string) => {
    if (!borrowModal) return;
    try {
      await api('/loans', {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(readerId),
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          items: [{ book_id: parseInt(borrowModal.id), quantity: 1 }],
        }),
      });
      showToast('Tạo phiếu mượn thành công!', 'success');
      setBorrowModal(null);
      fetchBooks();
      if (onLoanCreated) onLoanCreated();
    } catch (err: any) { showToast(err.message || 'Lỗi khi tạo phiếu mượn', 'error'); }
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

      {loading ? (
        <div className="loading-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="book-card-skeleton" />)}</div>
      ) : !filteredBooks.length ? (
        <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
      ) : (
        <div className="grid-3">{filteredBooks.map((book: any) => (
          <BookCard key={book.id} book={book} onBorrow={(id: any, title: any) => setBorrowModal({ id, title })} />
        ))}</div>
      )}

      <BorrowModal book={borrowModal} onClose={() => setBorrowModal(null)} onSubmit={handleBorrow} user={user} />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
