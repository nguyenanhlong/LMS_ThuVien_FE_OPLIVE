'use client';

import Link from 'next/link';
import { HeartIcon } from '@/components/ui/icons';
import { getCover } from '@/lib/category-covers';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';

export default function BookCard({ book, onRequireAuth }: { book: any; onRequireAuth: () => void }) {
  const cover = getCover(book.category);
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const inCart = isInCart(book.id);
  const favorite = isFavorite(book.id);

  const handleAddToCart = () => {
    if (!user) { onRequireAuth(); return; }
    addItem(book);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { onRequireAuth(); return; }
    toggleFavorite(book.id);
  };

  return (
    <div className="book-card glass-panel">
      <Link href={`/books/${book.id}`} className="book-card-link" id={`detail-link-${book.id}`}>
        <div className="book-cover" style={{ background: book.image_url ? undefined : cover.gradient }}>
          {book.image_url && <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          <div className="book-cover-overlay" />
          <span className={`book-cover-badge ${book.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}>
            {book.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đã mượn'}
          </span>
          <button
            onClick={handleToggleFavorite}
            className={`book-cover-favorite ${favorite ? 'active' : ''}`}
            aria-label={favorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            title={favorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <HeartIcon filled={favorite} />
          </button>
        </div>
        <div className="book-card-body">
          <span className="book-category" style={{ color: cover.accent }}>{book.category}</span>
          <h3 className="book-title">{book.title}</h3>
          <div className="book-author">{book.author}</div>
          {book.publisher && <div className="book-author" style={{ fontSize: '0.75rem', opacity: 0.6 }}>{book.publisher}</div>}
          <p className="book-desc">{book.description || 'Chưa có mô tả chi tiết.'}</p>
        </div>
      </Link>
      <div className="book-card-footer">
        {book.status === 'AVAILABLE' ? (
          <button
            onClick={handleAddToCart}
            className={`btn ${inCart ? 'btn-secondary' : 'btn-primary'} btn-full`}
            disabled={inCart}
            id={`add-to-cart-btn-${book.id}`}
          >
            {inCart ? 'Đã Có Trong Giỏ' : 'Thêm Vào Giỏ'}
          </button>
        ) : (
          <button className="btn btn-secondary btn-full" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Không Sẵn Sàng
          </button>
        )}
      </div>
    </div>
  );
}
