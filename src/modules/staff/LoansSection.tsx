'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { mapLoan } from '@/utils/mappers';
import LoanTable from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import ReturnModal from '@/components/loans/ReturnModal';
import Toast from '@/components/ui/Toast';

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
      const data = await api<any>('/loans?pageSize=100');
      setLoans((data.items || []).map(mapLoan));
    } catch { setLoans([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const activeLoans = useMemo(() => loans.filter((l: any) => l.status !== 'RETURNED'), [loans]);
  const completedLoans = useMemo(() => loans.filter((l: any) => l.status === 'RETURNED'), [loans]);
  const pendingLoans = useMemo(() => loans.filter((l: any) => l.status === 'PENDING'), [loans]);

  const handleApprove = async (requestId: string) => {
    showToast('Phiếu mượn đã được tạo tự động', 'success');
  };

  const handleReject = async (requestId: string) => {
    try {
      await api(`/loans/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      showToast('Đã hủy phiếu mượn!', 'success');
      fetchLoans();
    } catch { showToast('Lỗi khi hủy', 'error'); }
  };

  const handleReturn = async (loanId: string) => {
    try {
      await api(`/loans/${loanId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RETURNED' }),
      });
      showToast('Xác nhận trả sách thành công!', 'success');
      setReturnModal(null);
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi trả sách', 'error'); }
  };

  return (
    <div>
      {pendingLoans.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title" style={{ color: 'var(--primary)' }}>Yêu Cầu Trả Sách Đang Chờ</h2>
          <LoanTable
            loans={pendingLoans} loading={loading}
            role="MANAGER"
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
        onReject={handleReject}
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
