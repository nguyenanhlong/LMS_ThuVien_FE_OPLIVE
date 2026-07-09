'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { mapLoan } from '@/utils/mappers';
import LoanTable from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import ReturnModal from '@/components/loans/ReturnModal';
import Toast from '@/components/ui/Toast';

export default function LoansSection({ user }: any) {
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
      const data = await api<any>(`/loans?pageSize=100&user_id=${user.id}`);
      setLoans((data.items || []).map(mapLoan));
    } catch { setLoans([]); }
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const activeLoans = useMemo(() => loans.filter((l: any) => l.status !== 'RETURNED'), [loans]);
  const completedLoans = useMemo(() => loans.filter((l: any) => l.status === 'RETURNED'), [loans]);

  const handleReturn = async (loanId: string) => {
    try {
      await api(`/loans/${loanId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PENDING' }),
      });
      showToast('Yêu cầu trả sách đã được gửi, chờ xác nhận!', 'success');
      setReturnModal(null);
      fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi yêu cầu trả sách', 'error'); }
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
        onReturn={(loan: any) => setReturnModal(loan)}
      />
      {completedLoans.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 className="section-title">Lịch Sử Mượn Trả</h2>
          <LoanHistory loans={completedLoans} loading={loading} />
        </div>
      )}

      <ReturnModal open={!!returnModal} loan={returnModal} onConfirm={(id: string) => handleReturn(id)} onCancel={() => setReturnModal(null)} loading={false} isAdmin={false} confirmText="Xác Nhận Trả Sách" />
      <Toast message={toast?.text || ''} type={toast?.type || 'success'} />
    </div>
  );
}
