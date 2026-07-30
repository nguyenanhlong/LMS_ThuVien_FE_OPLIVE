'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMyFavoriteBooksApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import { useFavorites } from '@/context/FavoritesContext';
import BookCard from '@/components/books/BookCard';

export default function FavoritesSection({ onRequireAuth }: { onRequireAuth: () => void }) {
  const { favoriteIds } = useFavorites();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyFavoriteBooksApi();
      setBooks((data.items || []).map(mapBook));
    } catch {
      setBooks([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  // Lọc theo favoriteIds (đồng bộ với FavoritesContext) để sách vừa bấm bỏ yêu thích
  // biến mất ngay khỏi danh sách, không cần tải lại trang.
  const displayedBooks = useMemo(() => books.filter((b) => favoriteIds.has(b.id)), [books, favoriteIds]);

  if (loading) {
    return <div className="loading-grid">{[1, 2, 3].map((i) => <div key={i} className="book-card-skeleton" />)}</div>;
  }

  if (!displayedBooks.length) {
    return (
      <div className="empty-state">
        <p>Bạn chưa có sách yêu thích nào. Bấm vào biểu tượng ♥ trên bìa sách để thêm.</p>
      </div>
    );
  }

  return (
    <div className="grid-3">
      {displayedBooks.map((book) => (
        <BookCard key={book.id} book={book} onRequireAuth={onRequireAuth} />
      ))}
    </div>
  );
}
