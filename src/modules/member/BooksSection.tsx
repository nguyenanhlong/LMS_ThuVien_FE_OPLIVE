'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBooksApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookCard from '@/components/books/BookCard';

const PAGE_SIZE = 9;

export default function BooksSection({ searchTerm, selectedCategory, onRequireAuth }: any) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooksApi({ keyword: searchTerm });
      setBooks((data.items || []).map(mapBook));
    } catch { setBooks([]); }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'Tất cả') return books;
    return books.filter((b: any) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  // Đổi từ khóa tìm kiếm hoặc thể loại thì quay lại trang 1.
  useEffect(() => { setPage(1); }, [searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));

  // Nếu danh sách ngắn lại (vd. đổi bộ lọc) khiến trang hiện tại vượt quá tổng số trang thì kéo về trang cuối.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedBooks = useMemo(
    () => filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredBooks, page],
  );

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  return (
    <div>
      {loading ? (
        <div className="loading-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="book-card-skeleton" />)}</div>
      ) : !filteredBooks.length ? (
        <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
      ) : (
        <>
          <div className="grid-3">{pagedBooks.map((book: any) => (
            <BookCard key={book.id} book={book} onRequireAuth={onRequireAuth} />
          ))}</div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-nav"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Trước
              </button>
              <div className="pagination-pages">
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    className={`pagination-page ${n === page ? 'active' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                className="pagination-nav"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
