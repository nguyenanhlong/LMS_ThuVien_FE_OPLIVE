'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBooksApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookCard from '@/components/books/BookCard';
import RecommendedBooks from '@/components/books/RecommendedBooks';

const PAGE_SIZE = 12;

export default function BooksSection({
  searchTerm,
  selectedCategoryId,
  subCategories,
  selectedSubCategoryId,
  onSelectSubCategory,
  showRecommended,
  onRequireAuth,
}: any) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooksApi({
        keyword: searchTerm,
        category_id: selectedCategoryId ?? undefined,
        sub_category_id: selectedSubCategoryId ?? undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setBooks((data.items || []).map(mapBook));
      setTotalPages(Math.max(1, data.totalPages || 1));
    } catch {
      setBooks([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, [searchTerm, selectedCategoryId, selectedSubCategoryId, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Đổi từ khóa tìm kiếm, thể loại hoặc thể loại con thì quay lại trang 1.
  useEffect(() => { setPage(1); }, [searchTerm, selectedCategoryId, selectedSubCategoryId]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      {showRecommended && <RecommendedBooks />}

      {!!subCategories?.length && (
        <div className="sub-category-select-wrap">
          <label htmlFor="sub-category-select">Danh mục con</label>
          <select
            id="sub-category-select"
            className="form-control sub-category-select"
            value={selectedSubCategoryId ?? ''}
            onChange={(e) => onSelectSubCategory(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Tất cả</option>
            {subCategories.map((sc: { id: number; name: string }) => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="loading-grid">{Array.from({ length: PAGE_SIZE }, (_, i) => <div key={i} className="book-card-skeleton" />)}</div>
      ) : !books.length ? (
        <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
      ) : (
        <>
          <div className="grid-3">{books.map((book: any) => (
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
