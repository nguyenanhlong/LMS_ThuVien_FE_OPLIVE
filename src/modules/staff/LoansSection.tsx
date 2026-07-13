'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { graphqlQuery } from '@/lib/api';
import { mapLoan } from '@/utils/mappers';
import LoanTable from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import ReturnModal from '@/components/loans/ReturnModal';
import Toast from '@/components/ui/Toast';

const LOAN_FRAGMENT = `
  id
  loan_date
  status
  cancelled_reason
  total_deposit
  total_rental_fee
  total_amount
  total_fine
  total_lost_fee
  total_initial_payment
  total_deposit_refund
  total_extra_payment
  borrower {
    user_id
    full_name
    email
  }
  books {
    loan_detail_id
    book_id
    title
    author
    image_url
    quantity
    borrow_days
    due_date
    return_date
    status
    deposit_amount
    rental_fee
    fine_amount
    lost_quantity
    lost_fee
    deposit_refund_amount
    extra_payment_amount
  }
`;

export default function LoansSection() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [returnModal, setReturnModal] = useState<any>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await graphqlQuery(`
        query GetLoans($query: GetLoansInput) {
          loans(query: $query) {
            items {
              ${LOAN_FRAGMENT}
            }
          }
        }
      `, { query: { pageSize: 100 } });
      setLoans((res.loans?.items || []).map(mapLoan));
    } catch { setLoans([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const activeLoans = useMemo(() => loans.filter((l: any) => l.status !== 'COMPLETED' && l.status !== 'CANCELLED'), [loans]);
  const completedLoans = useMemo(() => loans.filter((l: any) => l.status === 'COMPLETED' || l.status === 'CANCELLED'), [loans]);
  const pendingLoans = useMemo(() => loans.filter((l: any) => l.status === 'PENDING'), [loans]);

  // PENDING → PENDING_PAYMENT (staff confirms the loan info)
  const handleConfirmLoan = async (loanId: string) => {
    try {
      await graphqlQuery(`
        mutation ConfirmLoan($id: ID!) {
          confirmLoan(id: $id)
        }
      `, { id: loanId });
      showToast('Đã xác nhận phiếu mượn, chờ độc giả thanh toán!', 'success');
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xác nhận phiếu mượn', 'error'); }
  };

  // PENDING_PAYMENT → BORROWING (customer paid, books handed out)
  const handlePayAndBorrow = async (loanId: string) => {
    try {
      await graphqlQuery(`
        mutation PayAndBorrow($id: ID!) {
          payAndBorrow(id: $id)
        }
      `, { id: loanId });
      showToast('Xác nhận thanh toán & giao sách thành công!', 'success');
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xác nhận mượn sách', 'error'); }
  };

  // Staff approves based on current status
  const handleApprove = async (loanId: string) => {
    // Find the loan to determine its current status
    const loan = loans.find((l: any) => String(l.id) === String(loanId));
    if (!loan) return;
    if (loan.status === 'PENDING') {
      await handleConfirmLoan(loanId);
    } else if (loan.status === 'PENDING_PAYMENT') {
      await handlePayAndBorrow(loanId);
    }
  };

  const handleCancel = async (loanId: string, reason: string) => {
    try {
      await graphqlQuery(`
        mutation CancelLoan($id: ID!, $reason: String!) {
          cancelLoan(id: $id, reason: $reason)
        }
      `, { id: loanId, reason });
      showToast('Đã hủy phiếu mượn!', 'success');
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi hủy phiếu mượn', 'error'); }
  };

  // BORROWING → RETURNED for a specific loan_detail
  const handleReturn = async (loanId: string) => {
    const loan = loans.find((l: any) => String(l.id) === String(loanId));
    if (!loan) return;
    try {
      // Return each book detail that is still borrowing/overdue
      const rawLoan = loan._raw;
      if (rawLoan?.books) {
        for (const book of rawLoan.books) {
          if (book.status === 'BORROWING' || book.status === 'OVERDUE') {
            await graphqlQuery(`
              mutation ReturnLoanDetail($detailId: ID!, $lostQuantity: Int) {
                returnLoanDetail(detailId: $detailId, lostQuantity: $lostQuantity)
              }
            `, { detailId: book.loan_detail_id, lostQuantity: 0 });
          }
        }
      } else {
        // Fallback: try getting from returnModal which stores raw data
        const detail = returnModal?.books?.[0];
        if (detail) {
          await graphqlQuery(`
            mutation ReturnLoanDetail($detailId: ID!, $lostQuantity: Int) {
              returnLoanDetail(detailId: $detailId, lostQuantity: $lostQuantity)
            }
          `, { detailId: detail.loan_detail_id, lostQuantity: 0 });
        }
      }
      showToast('Xác nhận trả sách thành công!', 'success');
      setReturnModal(null);
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xác nhận trả sách', 'error'); }
  };

  return (
    <div>
      {pendingLoans.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title" style={{ color: 'var(--primary)' }}>Phiếu Mượn Đang Chờ Duyệt</h2>
          <LoanTable
            loans={pendingLoans} loading={loading}
            role="MANAGER"
            onApprove={handleApprove}
            onReject={handleCancel}
            onReturn={(loan: any) => setReturnModal(loan)}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Danh Sách Mượn Trả</h2>
      </div>
      <LoanTable
        loans={activeLoans.filter((l: any) => l.status !== 'PENDING')}
        loading={loading}
        role="MANAGER"
        onApprove={handleApprove}
        onReject={handleCancel}
        onReturn={(loan: any) => setReturnModal(loan)}
      />
      {completedLoans.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 className="section-title">Lịch Sử Mượn Trả</h2>
          <LoanHistory loans={completedLoans} loading={loading} />
        </div>
      )}

      <ReturnModal open={!!returnModal} loan={returnModal} onConfirm={(id: string) => handleReturn(id)} onCancel={() => setReturnModal(null)} loading={false} isAdmin={true} confirmText="Xác Nhận Thu Hồi" />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
