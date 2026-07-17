'use client';

import { useState, useEffect, useCallback } from 'react';
import { cancelLoanApi, getLoansApi } from '@/lib/api';
import { mapMemberLoan } from '@/utils/mappers';
import { LoanStatusBadge, LoanDetailStatusBadge, canCancelLoan } from '@/components/loans/LoanStatusBadge';
import CancelLoanModal from '@/components/loans/CancelLoanModal';
import Toast from '@/components/ui/Toast';

export default function LoansSection({ user }: any) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState<any>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoansApi({ user_id: user.id, pageSize: 100 });
      setLoans((data.items || []).map(mapMemberLoan));
    } catch {
      setLoans([]);
      showToast('Không tải được danh sách phiếu mượn', 'error');
    }
    setLoading(false);
  }, [user.id, showToast]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleCancel = async (reason: string) => {
    if (!cancelModal) return;
    try {
      await cancelLoanApi(cancelModal.id, reason);
      showToast('Đã hủy phiếu mượn', 'success');
      setCancelModal(null);
      fetchLoans();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi hủy phiếu mượn', 'error');
    }
  };

  return (
    <div>
      <h2 className="section-title">Phiếu Mượn Của Tôi</h2>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      ) : !loans.length ? (
        <div className="empty-state"><p>Bạn chưa có phiếu mượn nào</p></div>
      ) : (
        <div className="loan-card-list">
          {loans.map((loan) => (
            <div key={loan.id} className="loan-card glass-panel">
              <div className="loan-card-header">
                <div>
                  <span className="loan-card-id">Phiếu #{loan.id}</span>
                  {loan.loanDate && <span className="loan-card-date"> · {loan.loanDate}</span>}
                </div>
                <LoanStatusBadge status={loan.status} />
              </div>

              <div className="loan-card-books">
                {loan.books.map((bk: any) => (
                  <div key={bk.loanDetailId} className="loan-book-row">
                    <div className="loan-book-info">
                      <span className="loan-book-title">{bk.title}</span>
                      <span className="loan-book-meta">
                        SL: {bk.quantity} · {bk.borrowDays} ngày
                        {bk.dueDate && ` · Hạn trả: ${bk.dueDate}`}
                        {bk.returnDate && ` · Đã trả: ${bk.returnDate}`}
                      </span>
                    </div>
                    <LoanDetailStatusBadge status={bk.status} />
                  </div>
                ))}
              </div>

              {(loan.totalDeposit > 0 || loan.totalRentalFee > 0) && (
                <div className="loan-card-fees">
                  <span>Đặt cọc: <strong>{loan.totalDeposit.toLocaleString('vi-VN')}đ</strong></span>
                  <span>Phí thuê: <strong>{loan.totalRentalFee.toLocaleString('vi-VN')}đ</strong></span>
                  {loan.totalFine > 0 && <span>Phạt trễ hạn: <strong>{loan.totalFine.toLocaleString('vi-VN')}đ</strong></span>}
                </div>
              )}

              {loan.cancelledReason && (
                <p className="loan-card-cancel-reason">Lý do hủy: {loan.cancelledReason}</p>
              )}

              {canCancelLoan(loan.status) && (
                <div className="loan-card-actions">
                  <button onClick={() => setCancelModal(loan)} className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                    Hủy Phiếu
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CancelLoanModal loan={cancelModal} onClose={() => setCancelModal(null)} onConfirm={handleCancel} />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
