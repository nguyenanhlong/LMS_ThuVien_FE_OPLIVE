'use client';

import { ArrowLeftIcon, BookIcon } from '@/components/ui/icons';
import { getCover } from '@/lib/category-covers';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function BookDetail({ book }: any) {
  const cover = getCover(book.category);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
      <div>
        <div style={{
          background: cover.gradient,
          borderRadius: '16px',
          aspectRatio: '3/4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          boxShadow: `0 20px 60px ${cover.accent}44`,
          position: 'relative',
          overflow: 'hidden',
        }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'ID sách', value: book.id },
            { label: 'Thể loại', value: book.category },
            { label: 'Tác giả', value: book.author },
            { label: 'Trạng thái', value: book.status },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {label}
              </div>
              <div style={{ fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
