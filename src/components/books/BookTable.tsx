'use client';

export default function BookTable({
  books,
  loading,
  onEdit,
  onDelete,
  onAdd,
  onView,
}: {
  books: any[];
  loading: boolean;
  onEdit: (book: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onView?: (book: any) => void;
}) {
  return (
    <div>
      <div className="manager-header-actions">
        <h2 className="section-title">Quản Lý Sách</h2>
        <button onClick={onAdd} className="btn btn-primary" id="btn-add-book">
          Thêm Sách Mới
        </button>
      </div>
      {loading ? (
        <div className="empty-state"><p>Đang tải...</p></div>
      ) : !books?.length ? (
        <div className="empty-state"><p>Thư viện chưa có đầu sách nào</p></div>
      ) : (
        <div className="table-wrapper glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tên Sách</th>
                <th>Tác Giả</th>
                <th>Thể Loại</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book: any) => (
                <tr key={book.id}>
                  <td>
                    <div className="table-book-title">
                      {book.image_url ? (
                        <img src={book.image_url} alt="" className="table-book-cover" style={{ objectFit: 'cover', background: 'var(--bg-tertiary)' }} />
                      ) : (
                        <div className="table-book-cover" style={{ background: 'var(--bg-tertiary)' }} />
                      )}
                      <span style={{ fontWeight: 600 }}>{book.title}</span>
                    </div>
                  </td>
                  <td>{book.author}</td>
                  <td><span className="category-tag">{book.category || '—'}</span></td>
                  <td>
                    <span className={`badge ${book.available_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {book.available_quantity > 0 ? `Còn ${book.available_quantity}/${book.total_quantity}` : 'Hết sách'}
                    </span>
                    {!book.is_active && (
                      <span className="badge badge-danger" style={{ marginLeft: 6 }}>Ngừng cho mượn</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => onView ? onView(book) : window.location.href = `/books/${book.id}`} className="btn btn-edit" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                        Xem
                      </button>
                      <button onClick={() => onEdit(book)} className="btn btn-edit" style={{ padding: '6px 14px', fontSize: '0.8125rem' }} id={`edit-btn-${book.id}`}>
                        Sửa
                      </button>
                      <button onClick={() => onDelete(book.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8125rem' }} id={`delete-btn-${book.id}`}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
