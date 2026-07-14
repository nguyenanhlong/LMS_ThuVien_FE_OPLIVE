'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { graphqlQuery } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookCard from '@/components/books/BookCard';
import BorrowModal from '@/components/books/BorrowModal';
import RecommendedBooks from '@/components/books/RecommendedBooks';
import Toast from '@/components/ui/Toast';

export default function BooksSection({ user, searchTerm, selectedCategory, onLoanCreated }: any) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [borrowModal, setBorrowModal] = useState<any>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await graphqlQuery(`
        query GetBooks($query: GetBooksInput) {
          books(query: $query) {
            items {
              id
              title
              author
              publisher
              description
              total_quantity
              borrowed_quantity
            }
          }
        }
      `, {
        query: {
          keyword: searchTerm,
          pageSize: 100
        }
      });
      setBooks((res.books?.items || []).map(mapBook));
    } catch { setBooks([]); }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'Tất cả') return books;
    return books.filter((b: any) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const handleBorrow = async (quantity: number, borrowDays: number) => {
    if (!borrowModal) return;
    try {

      await graphqlQuery(`
        mutation CreateLoan($input: CreateLoanInput!) {
          createLoan(input: $input) {
            id
          }
        }
      `, {
        input: {
          user_id: user.id,
          items: [{ book_id: parseInt(borrowModal.id), quantity, borrow_days: borrowDays }],
        }
      });
      showToast('Gửi yêu cầu mượn thành công! Chờ thủ thư xác nhận.', 'success');
      setBorrowModal(null);
      fetchBooks();
      if (onLoanCreated) onLoanCreated();
    } catch (err: any) { showToast(err.message || 'Lỗi khi tạo phiếu mượn', 'error'); }
  };

  return (
    <div>
      <RecommendedBooks />

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
