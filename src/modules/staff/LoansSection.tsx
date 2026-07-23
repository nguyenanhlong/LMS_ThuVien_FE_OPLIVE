'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getLoansApi, getLoanByIdApi,
  confirmLoanApi, borrowingLoanApi, returnLoanDetailApi, cancelLoanApi,
} from '@/lib/api';
import { mapLoan } from '@/utils/mappers';
import LoanTable, { LOAN_STATUS_MAP } from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import ReturnModal from '@/components/loans/ReturnModal';
import CancelLoanModal from '@/components/loans/CancelLoanModal';
import Toast from '@/components/ui/Toast';

const FILTERS = ['ALL', 'PENDING', 'PENDING_PAYMENT', 'BORROWING', 'OVERDUE', 'COMPLETED', 'CANCELLED'];

export default function LoansSection() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returnModal, setReturnModal] = useState<any>(null);
  const [cancelLoanId, setCancelLoanId] = useState<string | null>(null); 
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoansApi({ pageSize: 100 });
      setLoans((data.items || []).map(mapLoan));
    } catch { setLoans([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const overdueLoans = useMemo(() => loans.filter((l) => l.status === 'OVERDUE'), [loans]);
  const doneLoans = useMemo(
    () => loans.filter((l) => l.status === 'COMPLETED' || l.status === 'CANCELLED'),
    [loans]
  );
  const workingLoans = useMemo(
    () => loans.filter((l) => !['COMPLETED', 'CANCELLED', 'OVERDUE'].includes(l.status)),
    [loans]
  );

  const displayed = useMemo(() => {
    if (filter === 'ALL') return workingLoans;
    return loans.filter((l) => l.status === filter);
  }, [filter, loans, workingLoans]);

  const handleConfirm = async (id: string) => {
    setSubmitting(true);
    try {
      await confirmLoanApi(id);
      showToast('Đã xác nhận yêu cầu mượn — chờ độc giả thanh toán!', 'success');
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi xác nhận', 'error'); }
    setSubmitting(false);
  };

  const handleBorrowing = async (id: string) => {
    setSubmitting(true);
    try {
      await borrowingLoanApi(id);
      showToast('Đã giao sách cho độc giả!', 'success');
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi giao sách', 'error'); }
    setSubmitting(false);
  };

  const handleCancel = (id: string) => {
    setCancelLoanId(id);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelLoanId) return;
    setSubmitting(true);
    try {
      await cancelLoanApi(cancelLoanId, reason);
      showToast('Đã hủy phiếu mượn!', 'success');
      setCancelLoanId(null);
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi hủy', 'error'); }
    setSubmitting(false);
  };

  const openReturnModal = async (loan: any) => {
    try {
      const full = await getLoanByIdApi(loan.id);
      setReturnModal(mapLoan(full));
    } catch {
      setReturnModal(loan);
    }
  };

  const handleReturnDetail = async (detailId: string, returnQty: number, lostQty: number) => {
    setSubmitting(true);
    try {
      await returnLoanDetailApi(detailId, { return_quantity: returnQty, lost_quantity: lostQty });
      showToast('Đã thu hồi sách thành công!', 'success');
      const updated = await getLoanByIdApi(returnModal.id);
      const mapped = mapLoan(updated);
      const stillPending = mapped.details.some((d: any) => d.status !== 'RETURNED' && d.status !== 'CANCELLED');
      setReturnModal(stillPending ? mapped : null);
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi trả sách', 'error'); }
    setSubmitting(false);
  };

  return (
    <div>
      {overdueLoans.length > 0 && (
        <div style={{
          marginBottom: 24, padding: 16, borderRadius: 12,
          background: 'rgba(239,68,68,0.08)', border: '1px solid var(--error)',
        }}>
          <h2 className="section-title" style={{ color: 'var(--error)', marginBottom: 12 }}>
            ⚠ Có {overdueLoans.length} phiếu mượn QUÁ HẠN cần xử lý gấp
          </h2>
          <LoanTable loans={overdueLoans} loading={loading} role="MANAGER" onReturn={openReturnModal} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`category-pill ${filter === s ? 'active' : ''}`}
          >
            {s === 'ALL' ? 'Đang xử lý' : LOAN_STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      <h2 className="section-title">Danh Sách Phiếu Mượn</h2>
      <LoanTable
        loans={displayed} loading={loading} role="MANAGER"
        onConfirm={handleConfirm}
        onBorrowing={handleBorrowing}
        onCancel={handleCancel}
        onReturn={openReturnModal}
      />

      {doneLoans.length > 0 && filter === 'ALL' && (
        <div style={{ marginTop: 40 }}>
          <h2 className="section-title">Lịch Sử Mượn Trả</h2>
          <LoanHistory loans={doneLoans} loading={loading} />
        </div>
      )}

      <ReturnModal
        open={!!returnModal}
        loan={returnModal}
        onReturnDetail={handleReturnDetail}
        onCancel={() => setReturnModal(null)}
        loading={submitting}
      />
      <CancelLoanModal
        loan={cancelLoanId ? { id: cancelLoanId } : null}
        onClose={() => setCancelLoanId(null)}
        onConfirm={handleConfirmCancel}
      />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}