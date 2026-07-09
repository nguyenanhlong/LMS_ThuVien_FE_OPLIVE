'use client';

import BookCard from './BookCard';
import BookTable from './BookTable';

const categories = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính'];

export default function BooksPage({ isManager, booksLoading, filteredBooks, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, onAdd, onEdit, onDelete, onBorrow }: any) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ maxWidth: '360px', background: 'var(--bg-secondary)' }} placeholder="Tìm kiếm sách..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`category-pill ${selectedCategory === c ? 'active' : ''}`}>{c}</button>
          ))}
        </div>
      </div>

      {!isManager ? (
        booksLoading ? (
          <div className="loading-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="book-card-skeleton" />)}</div>
        ) : !filteredBooks.length ? (
          <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
        ) : (
          <div className="grid-3">{filteredBooks.map((book: any) => (
            <BookCard key={book.id} book={book} onBorrow={(id: any, title: any) => onBorrow({ id, title })} />
          ))}</div>
        )
      ) : (
        <BookTable
          books={filteredBooks} loading={booksLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      )}
    </div>
  );
}
