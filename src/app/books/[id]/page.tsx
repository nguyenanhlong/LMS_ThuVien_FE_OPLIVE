'use client';

import React, { use } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import BookDetail from '@/components/books/BookDetail';
import { ArrowLeftIcon } from '@/components/ui/icons';

const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) { id title author category description status }
  }
`;

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useQuery<{ book: any }>(GET_BOOK, { variables: { id } });
  const book = data?.book;

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="logo">THƯ VIỆN <span className="gradient-text">SỐ</span></div>
          <button onClick={() => router.back()} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <ArrowLeftIcon /> Quay lại
          </button>
        </div>
      </header>
      <main className="main-content container" style={{ paddingTop: '32px' }}>
        {loading && <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin sách...</p></div>}
        {error && <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}><p style={{ color: 'var(--error)' }}>Lỗi: {error.message}</p></div>}
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
