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

  const refreshOneLoan = useCallback(async (loanId: string) => {
    try {
      const updated = await getLoanByIdApi(loanId);
      const mapped = mapLoan(updated);
      setLoans(prev => prev.map(l => l.id === loanId ? mapped : l));
      return mapped;
    } catch {
      fetchLoans();
      return null;
    }
  }, [fetchLoans]);

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
      await refreshOneLoan(id);
      showToast('\u0110\u00e3 x\u00e1c nh\u1eadn y\u00eau c\u1ea7u m\u01b0\u1ee3n \u2014 ch\u1edd \u0111\u1ed9c gi\u1ea3 thanh to\u00e1n!', 'success');
    } catch (e: any) { showToast(e.message || 'L\u1ed7i khi x\u00e1c nh\u1eadn', 'error'); }
    setSubmitting(false);
  };

  const handleBorrowing = async (id: string) => {
    setSubmitting(true);
    try {
      await borrowingLoanApi(id);
      await refreshOneLoan(id);
      showToast('\u0110\u00e3 giao s\u00e1ch cho \u0111\u1ed9c gi\u1ea3!', 'success');
    } catch (e: any) { showToast(e.message || 'L\u1ed7i khi giao s\u00e1ch', 'error'); }
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
      await refreshOneLoan(cancelLoanId);
      showToast('\u0110\u00e3 h\u1ee7y phi\u1ebfu m\u01b0\u1ee3n!', 'success');
      setCancelLoanId(null);
    } catch (e: any) { showToast(e.message || 'L\u1ed7i khi h\u1ee7y', 'error'); }
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

  const handleReturnDetail = async (detailId: string, returnQty: number, lostQty: number, note?: string) => {
    setSubmitting(true);
    try {
      await returnLoanDetailApi(detailId, { return_quantity: returnQty, lost_quantity: lostQty, note });
      showToast('\u0110\u00e3 thu h\u1ed3i s\u00e1ch th\u00e0nh c\u00f4ng!', 'success');
      const mapped = await refreshOneLoan(returnModal.id);
      if (mapped) {
        const stillPending = mapped.details.some((d: any) => d.status !== 'RETURNED' && d.status !== 'CANCELLED');
        setReturnModal(stillPending ? mapped : null);
      } else {
        setReturnModal(null);
      }
    } catch (e: any) { showToast(e.message || 'L\u1ed7i khi tr\u1ea3 s\u00e1ch', 'error'); }
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
            {'⚠ Có'} {overdueLoans.length} {'phiếu mượn QUÁ HẠN cần xử lý gấp'}
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
            {s === 'ALL' ? '\u0110ang x\u1EED l\u00FD' : LOAN_STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      <h2 className="section-title">{'Danh Sách Phiếu Mượn'}</h2>
      <LoanTable
        loans={displayed} loading={loading} role="MANAGER"
        onConfirm={handleConfirm}
        onBorrowing={handleBorrowing}
        onCancel={handleCancel}
        onReturn={openReturnModal}
      />

      {doneLoans.length > 0 && filter === 'ALL' && (
        <div style={{ marginTop: 40 }}>
          <h2 className="section-title">{'Lịch Sử Mượn Trả'}</h2>
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