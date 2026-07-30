'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getBookApi } from '@/lib/api';
import { mapBook } from '@/utils/mappers';
import BookDetail from '@/components/books/BookDetail';
import { ArrowLeftIcon } from '@/components/ui/icons';

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const b = await getBookApi(id);
        setBook(mapBook(b));
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin sách');
      }
      setLoading(false);
    })();
  }, [id]);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <span className="brand-icon">📖</span>
            <div className="brand-text">
              <span className="brand-title">THƯ VIỆN <span className="gradient-text">SỐ</span></span>
              <span className="brand-subtitle">Thư viện đọc sách trực tuyến</span>
            </div>
          </div>
          <button onClick={() => router.back()} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <ArrowLeftIcon /> Quay lại
          </button>
        </div>
      </header>
      <main className="main-content container" style={{ paddingTop: '32px' }}>
        {loading && <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin sách...</p></div>}
        {error && <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}><p style={{ color: 'var(--error)' }}>Lỗi: {error}</p></div>}
        {!loading && !error && !book && (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '8px' }}>Không tìm thấy sách</h2>
            <p style={{ color: 'var(--text-muted)' }}>Không có sách nào với id = <code style={{ color: '#fbbf24' }}>"{id}"</code></p>
            <button onClick={() => router.back()} className="btn btn-primary" style={{ cursor: 'pointer', marginTop: '24px' }}>Quay lại</button>
          </div>
        )}
        {book && <BookDetail book={book} />}
      </main>
    </>
  );
}
