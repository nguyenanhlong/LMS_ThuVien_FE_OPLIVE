'use client';

import LoanTable from './LoanTable';
import LoanHistory from './LoanHistory';

export default function LoansPage({ isManager, pendingLoans, activeLoans, completedLoans, loansLoading, onApprove, onReject, onReturn }: any) {
  return (
    <div>
      {isManager && pendingLoans.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title" style={{ color: 'var(--primary)' }}>Yêu Cầu Trả Sách Đang Chờ</h2>
          <LoanTable
            loans={pendingLoans} loading={loansLoading}
            role="MANAGER"
            onReturn={onReturn}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Danh Sách Mượn Trả</h2>
      </div>
      <LoanTable
        loans={isManager ? activeLoans.filter((l: any) => l.status !== 'PENDING') : activeLoans}
        loading={loansLoading}
        role={isManager ? 'MANAGER' : 'USER'}
        onApprove={onApprove} onReject={onReject}
        onReturn={onReturn}
      />
      {completedLoans.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 className="section-title">Lịch Sử Mượn Trả</h2>
          <LoanHistory loans={completedLoans} loading={loansLoading} />
        </div>
      )}
    </div>
  );
}
