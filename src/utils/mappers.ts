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
    author: b.author || '',
    category: b.publisher || 'Khác',
    description: b.description || '',
    image_url: resolveImageUrl(b.image_url),
    total_quantity: b.total_quantity || 0,
    borrowed_quantity: b.borrowed_quantity || 0,
    available_quantity: Math.max(available, 0),
    max_borrow_days: b.max_borrow_days ?? null,
    deposit_amount: Number(b.deposit_amount || 0),
    fee_per_day: Number(b.fee_per_day || 0),
    fee_per_week: Number(b.fee_per_week || 0),
    fee_per_month: Number(b.fee_per_month || 0),
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
    status: l.status === 'BORROWING' ? 'APPROVED' : l.status === 'RETURNED' ? 'RETURNED' : l.status === 'OVERDUE' ? 'OVERDUE' : l.status === 'PENDING' ? 'PENDING' : 'REJECTED',
  };
}

// Trạng thái thật theo backend LoanStatus/LoanDetailStatus (PENDING, PENDING_PAYMENT,
// BORROWING, COMPLETED, CANCELLED / OVERDUE, RETURNED) — dùng riêng cho khu vực Member
// vì mapLoan() ở trên vẫn giữ nguyên cho phần Staff (LoanTable/LoanHistory) dùng vocab cũ.
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
