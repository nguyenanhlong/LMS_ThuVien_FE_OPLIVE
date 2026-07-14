'use client';

import Badge from '@/components/ui/Badge';

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: string }> = {
    PENDING: { label: 'Chờ xác nhận', variant: 'warning' },
    PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'warning' },
    BORROWING: { label: 'Đang mượn', variant: 'success' },
    COMPLETED: { label: 'Đã hoàn tất', variant: 'muted' },
    OVERDUE: { label: 'Quá hạn', variant: 'danger' },
    CANCELLED: { label: 'Đã hủy', variant: 'muted' },
  };
  const s = map[status] || { label: status, variant: 'muted' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function RecentLoans({ loans, loading }: {
  loans: any[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 className="section-title" style={{ marginBottom: '16px' }}>Giao Dịch Gần Đây</h3>
        <div className="empty-state">Đang tải...</div>
      </div>
    );
  }

  const items = (loans || []).slice(0, 5);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 className="section-title" style={{ marginBottom: '16px' }}>Giao Dịch Gần Đây</h3>
      {items.length === 0 ? (
        <div className="empty-state">Chưa có giao dịch nào</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((loan: any) => (
            <div key={loan.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{loan.userName}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{loan.book?.title || 'Đầu sách đã bị xóa'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {statusBadge(loan.status)}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.requestDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
