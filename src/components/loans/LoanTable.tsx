'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: string }> = {
    PENDING: { label: 'Chờ duyệt', variant: 'info' },
    PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'warning' },
    BORROWING: { label: 'Đang mượn', variant: 'success' },
    COMPLETED: { label: 'Đã hoàn thành', variant: 'muted' },
    CANCELLED: { label: 'Đã hủy', variant: 'muted' },
    OVERDUE: { label: 'Quá hạn', variant: 'danger' },
  };
  const s = map[status] || { label: status, variant: 'muted' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function actionButtons(
  row: any,
  role: string,
  onApprove?: (id: string) => void,
  onReject?: (id: string, reason: string) => void,
  onReturn?: (loan: any) => void
) {
  const status = row.status;

  if (role === 'MANAGER') {
    if (status === 'PENDING') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onApprove?.(row.id)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Duyệt</button>
          <button onClick={() => {
            const reason = prompt('Nhập lý do hủy phiếu mượn:');
            if (reason) onReject?.(row.id, reason);
          }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Hủy</button>
        </div>
      );
    }
    if (status === 'PENDING_PAYMENT') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onApprove?.(row.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Xác Nhận Mượn</button>
          <button onClick={() => {
            const reason = prompt('Nhập lý do hủy phiếu mượn:');
            if (reason) onReject?.(row.id, reason);
          }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Hủy</button>
        </div>
      );
    }
    if (status === 'BORROWING' || status === 'OVERDUE') {
      return (
        <button onClick={() => onReturn?.(row)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Xác Nhận Trả</button>
      );
    }
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>;
  }

  if (role === 'USER') {
    if (status === 'PENDING' || status === 'PENDING_PAYMENT') {
      return (
        <button onClick={() => {
          const reason = prompt('Nhập lý do hủy mượn:');
          if (reason) onReject?.(row.id, reason);
        }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Hủy Yêu Cầu</button>
      );
    }
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>;
  }

  return null;
}

export default function LoanTable({ loans, loading, role, onApprove, onReject, onReturn }: {
  loans: any[];
  loading: boolean;
  role: 'USER' | 'MANAGER';
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onReturn?: (loan: any) => void;
}) {
  const columns = [
    { key: 'memberName', label: 'Độc giả', render: (row: any) => row.userName },
    { key: 'bookTitle', label: 'Tên sách', render: (row: any) => row.book?.title || 'Đầu sách đã bị xóa' },
    { key: 'requestDate', label: 'Ngày mượn' },
    { key: 'dueDate', label: 'Hạn trả' },
    { key: 'status', label: 'Trạng thái', render: (row: any) => statusBadge(row.status) },
    { key: 'actions', label: 'Hành động', render: (row: any) => actionButtons(row, role, onApprove, onReject, onReturn) },
  ];

  if (role === 'USER') {
    const userColumns = columns;
    return <Table columns={userColumns} data={loans} loading={loading} emptyText="Không có yêu cầu mượn nào" />;
  }

  return <Table columns={columns} data={loans} loading={loading} emptyText="Không có yêu cầu nào" />;
}
