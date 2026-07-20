'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBooksApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import { getCover } from '@/lib/category-covers';

export default function RecommendedBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getBooksApi({ pageSize: 10 });
        if (!cancelled) setBooks((data.items || []).map(mapBook));
      } catch {
        if (!cancelled) setBooks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loading && !books.length) return null;

  return (
    <section className="recommended-section" id="recommended-books">
      <div className="recommended-header">
        <h2>Sách đề cử</h2>
        <Link href="/books" className="recommended-more">Xem tất cả ›</Link>
      </div>

      <div className="recommended-scroll">
        {loading
          ? [1, 2, 3, 4, 5].map((i) => <div key={i} className="recommended-skeleton" />)
          : books.map((book) => {
              const cover = getCover(book.category);
              return (
                <Link key={book.id} href={`/books/${book.id}`} className="recommended-card">
                  <div className="recommended-cover" style={{ background: cover.gradient }}>
                    {book.image_url && <img src={book.image_url} alt={book.title} />}
                    <span className={`book-cover-badge ${book.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>
                      {book.status === 'AVAILABLE' ? 'Còn sách' : 'Hết sách'}
                    </span>
                  </div>
                  <div className="recommended-title">{book.title}</div>
                  <div className="recommended-meta">{book.author || book.category}</div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
