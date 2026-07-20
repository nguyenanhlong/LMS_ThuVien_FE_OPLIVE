'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBooksApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookCard from '@/components/books/BookCard';
import RecommendedBooks from '@/components/books/RecommendedBooks';

export default function BooksSection({ searchTerm, selectedCategory }: any) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <RecommendedBooks />

      {loading ? (
        <div className="loading-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="book-card-skeleton" />)}</div>
      ) : !filteredBooks.length ? (
        <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
      ) : (
        <div className="grid-3">{filteredBooks.map((book: any) => (
          <BookCard key={book.id} book={book} />
        ))}</div>
      )}
    </div>
  );
}
