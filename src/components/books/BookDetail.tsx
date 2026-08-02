'use client';

import { ArrowLeftIcon, BookIcon } from '@/components/ui/icons';
import { getCover } from '@/lib/category-covers';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function BookDetail({ book, onRequireAuth, isStaff }: any) {
  const cover = getCover(book.category);
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(book.id);

  const handleAddToCart = () => {
    if (!user) { onRequireAuth?.(); return; }
    addItem(book);
  };

  const renderActions = () => {
    if (isStaff) {
      return (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
        }}>
          <span>Bạn đang xem thông tin sách ở chế độ quản lý.</span>
        </div>
      );
    }

    return book.status === 'AVAILABLE' ? (
      <button
        onClick={handleAddToCart}
        className={`btn ${inCart ? 'btn-secondary' : 'btn-primary'}`}
        disabled={inCart}
        style={{ padding: '14px 32px', fontSize: '1rem' }}
      >
        {inCart ? 'Đã Có Trong Giỏ' : 'Thêm Vào Giỏ Hàng'}
      </button>
    ) : (
      <button className="btn btn-secondary" disabled style={{ padding: '14px 32px', fontSize: '1rem', opacity: 0.5, cursor: 'not-allowed' }}>
        Không Sẵn Sàng Cho Mượn
      </button>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
      <div>
        <div style={{
          background: book.image_url ? undefined : cover.gradient,
          borderRadius: '16px',
          aspectRatio: '3/4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: book.image_url ? 0 : '32px',
          boxShadow: `0 20px 60px ${cover.accent}44`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {book.image_url ? (
            <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(1px)',
              }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <BookIcon />
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.4, marginTop: '16px' }}>
                  {book.title}
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <span
            className={`badge ${book.status === 'AVAILABLE' ? 'badge-success' : 'badge-danger'}`}
            style={{ fontSize: '0.95rem', padding: '8px 20px' }}
          >
            {book.status === 'AVAILABLE' ? 'Sẵn sàng cho mượn' : 'Đang được mượn'}
          </span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <span
          className="category-tag"
          style={{ color: cover.accent, borderColor: cover.accent, marginBottom: '16px', display: 'inline-block' }}
        >
          {book.category}
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.3 }}>
          {book.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '32px' }}>
          {book.author}
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          borderLeft: `4px solid ${cover.accent}`,
        }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Mô tả nội dung
          </h3>
          <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {book.description || 'Chưa có mô tả chi tiết.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'ID sách', value: book.id },
            { label: 'Thể loại', value: book.category },
            { label: 'Tác giả', value: book.author },
            { label: 'Trạng thái', value: book.status === 'AVAILABLE' ? 'Sẵn sàng' : 'Đang mượn' },
            { label: 'ISBN', value: book.isbn || '—' },
            { label: 'Nhà xuất bản', value: book.publisher || '—' },
            { label: 'Năm XB', value: book.publisher_year || '—' },
            { label: 'Số lượng', value: `${book.borrowedQuantity ?? book.borrowed_quantity ?? 0}/${book.totalQuantity ?? book.total_quantity ?? 0}` },
            { label: 'Còn lại', value: `${book.available_quantity ?? 0}` },
            { label: 'Số ngày mượn tối đa', value: book.max_borrow_days ? `${book.max_borrow_days} ngày` : '—' },
            { label: 'Tiền cọc', value: book.deposit_amount ? `${Number(book.deposit_amount).toLocaleString('vi-VN')}₫` : '—' },
            { label: 'Phí trễ hạn/ngày', value: book.fine_per_day ? `${Number(book.fine_per_day).toLocaleString('vi-VN')}₫` : '—' },
            { label: 'Phí thay thế', value: book.replacement_cost ? `${Number(book.replacement_cost).toLocaleString('vi-VN')}₫` : '—' },
            { label: 'Phí thuê/ngày', value: book.fee_per_day ? `${Number(book.fee_per_day).toLocaleString('vi-VN')}₫` : '—' },
            { label: 'Phí thuê/tuần', value: book.fee_per_week ? `${Number(book.fee_per_week).toLocaleString('vi-VN')}₫` : '—' },
            { label: 'Phí thuê/tháng', value: book.fee_per_month ? `${Number(book.fee_per_month).toLocaleString('vi-VN')}₫` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '12px',
            }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value}</div>
            </div>
          ))}
        </div>

        {renderActions()}
      </div>
    </div>
  );
}
