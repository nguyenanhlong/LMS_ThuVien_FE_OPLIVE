export function mapBook(b: any) {
  const available = (b.total_quantity || 0) - (b.borrowed_quantity || 0);
  return {
    id: String(b.id),
    title: b.title,
    author: b.author || '',
    category: b.publisher || 'Khác',
    description: b.description || '',
    total_quantity: b.total_quantity || 0,
    borrowed_quantity: b.borrowed_quantity || 0,
    status: available > 0 ? 'AVAILABLE' : 'BORROWED',
  };
}

export function mapLoan(l: any) {
  const firstBook = l.books?.[0] || {};
  return {
    id: String(l.id),
    book: { id: String(firstBook.book_id || ''), title: firstBook.title || '', author: firstBook.author || '' },
    userName: l.borrower?.full_name || '',
    requestDate: l.loan_date ? new Date(l.loan_date).toLocaleDateString('vi-VN') : '',
    dueDate: firstBook.due_date ? new Date(firstBook.due_date).toLocaleDateString('vi-VN') : '',
    returnDate: firstBook.return_date ? new Date(firstBook.return_date).toLocaleDateString('vi-VN') : '',
    status: l.status,
    _raw: l,
  };
}
