'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { graphqlQuery } from '@/lib/api';
import { mapLoan } from '@/utils/mappers';
import LoanTable from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import Toast from '@/components/ui/Toast';

export default function LoansSection({ user }: any) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
            }
          }
        }
      `, {
        query: {
          user_id: parseInt(user.id),
          pageSize: 100
        }
      });
      setLoans((res.loans?.items || []).map(mapLoan));
    } catch { setLoans([]); }
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const activeLoans = useMemo(() => loans.filter((l: any) => l.status !== 'COMPLETED'), [loans]);
  const completedLoans = useMemo(() => loans.filter((l: any) => l.status === 'COMPLETED'), [loans]);

  const handleCancel = async (loanId: string, reason: string) => {
    try {
      await graphqlQuery(`
        mutation CancelLoan($id: ID!, $reason: String!) {
          cancelLoan(id: $id, reason: $reason)
        }
      `, { id: loanId, reason });
      showToast('Đã hủy yêu cầu mượn thành công!', 'success');
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi hủy yêu cầu mượn', 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Phiếu Mượn Của Tôi</h2>
      </div>
      <LoanTable
        loans={activeLoans}
        loading={loading}
        role="USER"
        onReject={handleCancel}
      />
      {completedLoans.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 className="section-title">Lịch Sử Mượn Trả</h2>
          <LoanHistory loans={completedLoans} loading={loading} />
        </div>
      )}

      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
