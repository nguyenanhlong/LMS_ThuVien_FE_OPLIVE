import { API_BASE } from '@/lib/api';

// Backend trả image_url dạng đường dẫn tương đối (/uploads/books/xxx.png) — cần nối
// với gốc API vì frontend chạy khác cổng (3001) với backend (3000).
export function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE}${imageUrl}`;
}

// Khớp với LoansService.calculateRentalFee() ở backend — dùng để xem trước phí thuê.
export function calculateRentalFee(borrowDays: number, feePerDay: number, feePerWeek: number, feePerMonth: number) {
  const months = Math.floor(borrowDays / 30);
  let remainingDays = borrowDays % 30;
  const weeks = Math.floor(remainingDays / 7);
  remainingDays = remainingDays % 7;
  return months * feePerMonth + weeks * feePerWeek + remainingDays * feePerDay;
}

export function mapBook(b: any) {
  const available = (b.total_quantity || 0) - (b.borrowed_quantity || 0);
  return {
    id: String(b.id),
    title: b.title,
    isbn: b.isbn || '',
    author: b.author || '',
    category: b.sub_category?.category?.name || b.sub_category?.name || 'Khác',
    description: b.description || '',
    image_url: resolveImageUrl(b.image_url),
    sub_category_id: b.sub_category_id ?? b.sub_category?.id ?? null,
    sub_category_name: b.sub_category?.name || '',
    total_quantity: b.total_quantity || 0,
    borrowed_quantity: b.borrowed_quantity || 0,
    available_quantity: Math.max(available, 0),
    max_borrow_days: b.max_borrow_days ?? 14,
    deposit_amount: Number(b.deposit_amount || 0),
    fine_per_day: Number(b.fine_per_day || 0),
    replacement_cost: Number(b.replacement_cost || 0),
    fee_per_day: Number(b.fee_per_day || 0),
    fee_per_week: Number(b.fee_per_week || 0),
    fee_per_month: Number(b.fee_per_month || 0),
    is_active: b.is_active !== false,
    status: available > 0 ? 'AVAILABLE' : 'BORROWED',
  };
}

export function mapLoan(l: any) {
  const items = l.books || [];

  const dueDates = items.map((d: any) => d.due_date).filter(Boolean);
  const earliestDue = dueDates.length
    ? dueDates.reduce((a: string, b: string) => (new Date(a) < new Date(b) ? a : b))
    : null;

  const returnDates = items.map((d: any) => d.completed_at).filter(Boolean);
  const latestReturn = returnDates.length
    ? returnDates.reduce((a: string, b: string) => (new Date(a) > new Date(b) ? a : b))
    : null;

  const hasOverdueDetail = items.some((d: any) => d.status === 'OVERDUE');
  const isLate = l.status === 'BORROWING' && earliestDue && new Date(earliestDue) < new Date();
  const isOverdue = hasOverdueDetail || isLate;

  const firstBook = items[0] || {};

  return {
    id: String(l.id),
    raw: l,
    details: items.map((d: any) => ({
      id: String(d.loan_detail_id),
      bookId: String(d.book_id),
      title: d.title || 'Đầu sách đã bị xóa',
      author: d.author || '',
      quantity: d.quantity || 0,
      status: d.status,
      dueDate: d.due_date ? new Date(d.due_date).toLocaleDateString('vi-VN') : '',
      returnDate: d.completed_at ? new Date(d.completed_at).toLocaleDateString('vi-VN') : '',
      lostQuantity: Number(d.lost_quantity ?? 0),
    })),
    book: { id: String(firstBook.book_id || ''), title: firstBook.title || '', author: firstBook.author || '' },
    bookTitles: items.map((d: any) => d.title).filter(Boolean).join(', ') || '—',
    userName: l.borrower?.full_name || '',
    userId: l.borrower?.user_id,
    requestDate: l.loan_date ? new Date(l.loan_date).toLocaleDateString('vi-VN') : '',
    dueDate: earliestDue ? new Date(earliestDue).toLocaleDateString('vi-VN') : '',
    returnDate: latestReturn ? new Date(latestReturn).toLocaleDateString('vi-VN') : '',
    cancelledReason: l.cancelled_reason || '',
    totalAmount: Number(l.total_amount ?? 0),
    totalFine: Number(l.total_fine ?? 0),
    totalPayment: Number(l.total_initial_payment ?? 0),
    status: isOverdue ? 'OVERDUE' : l.status,
    _raw: l,
  };
}

export function mapMemberLoan(l: any) {
  return {
    id: String(l.id),
    status: l.status,
    cancelledReason: l.cancelled_reason || '',
    loanDate: l.loan_date ? new Date(l.loan_date).toLocaleDateString('vi-VN') : '',
    totalDeposit: Number(l.total_deposit || 0),
    totalRentalFee: Number(l.total_rental_fee || 0),
    totalAmount: Number(l.total_amount || 0),
    totalFine: Number(l.total_fine || 0),
    totalLostFee: Number(l.total_lost_fee || 0),
    books: (l.books || []).map((bk: any) => ({
      loanDetailId: String(bk.loan_detail_id),
      bookId: String(bk.book_id),
      title: bk.title || 'Đầu sách đã bị xóa',
      author: bk.author || '',
      quantity: bk.quantity || 0,
      borrowDays: bk.borrow_days || 0,
      dueDate: bk.due_date ? new Date(bk.due_date).toLocaleDateString('vi-VN') : '',
      returnDate: bk.return_date ? new Date(bk.return_date).toLocaleDateString('vi-VN') : '',
      status: bk.status,
    })),
  };
}
