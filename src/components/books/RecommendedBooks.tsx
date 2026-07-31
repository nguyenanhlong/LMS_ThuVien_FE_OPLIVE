'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { getBooksApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import { getCover } from '@/lib/category-covers';

export default function RecommendedBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Lăn chuột dọc trong lúc hover cũng cuộn ngang được, giống carousel Netflix —
  // dùng addEventListener thủ công (không dùng onWheel của React) vì React 17+ gắn
  // onWheel dạng passive mặc định nên preventDefault() bên trong sẽ không có tác dụng.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  if (!loading && !books.length) return null;

  return (
    <section className="recommended-section" id="recommended-books">
      <div className="recommended-header">
        <h2>Sách đề cử ›</h2>
      </div>

      <div className="recommended-scroll" ref={scrollRef}>
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
                  <div className="recommended-info">
                    <div className="recommended-title">{book.title}</div>
                    <div className="recommended-meta-row">
                      <span className="recommended-author">{book.author || book.category}</span>
                      <span className="recommended-time">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                        {book.max_borrow_days} ngày
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
