 'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { getCover } from '@/lib/category-covers';

export default function BookCard({
  book,
  onBorrow,
}: {
  book: any;
  onBorrow: (id: string, title: string) => void;
}) {
  const cover = getCover(book.category);

  return (
    <div className="book-card glass-panel">
      <div className="book-cover" style={{ background: book.image_url ? undefined : cover.gradient }}>
        {book.image_url && <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div className="book-cover-overlay" />
        <span className={`book-cover-badge ${book.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>
          {book.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đã mượn'}
        </span>
      </div>
      <div className="book-card-body">
        <span className="book-category" style={{ color: cover.accent }}>{book.category}</span>
        <h3 className="book-title">{book.title}</h3>
        <div className="book-author">{book.author}</div>
        <p className="book-desc">{book.description || 'Chưa có mô tả chi tiết.'}</p>
      </div>
      <div className="book-card-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {book.status === 'AVAILABLE' ? (
          <button onClick={() => onBorrow(book.id, book.title)} className="btn btn-primary btn-full" id={`borrow-btn-${book.id}`}>
            Mượn Sách
          </button>
        ) : (
          <button className="btn btn-secondary btn-full" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Không Sẵn Sàng
          </button>
        )}
        <Link
          href={`/books/${book.id}`}
          className="btn btn-secondary btn-full"
          style={{ textDecoration: 'none', textAlign: 'center' }}
          id={`detail-btn-${book.id}`}
        >
          Xem Chi Tiết <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
}