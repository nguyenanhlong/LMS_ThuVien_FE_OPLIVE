'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

export const LOAN_STATUS_MAP: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'info' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'warning' },
  BORROWING: { label: 'Đang mượn', variant: 'success' },
  COMPLETED: { label: 'Đã hoàn tất', variant: 'muted' },
  OVERDUE: { label: 'QUÁ HẠN', variant: 'danger' },
  CANCELLED: { label: 'Đã hủy', variant: 'muted' },
};

function statusBadge(status: string) {
  const s = LOAN_STATUS_MAP[status] || { label: status, variant: 'muted' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const btnStyle = { padding: '6px 12px', fontSize: '0.8125rem' };

function actionButtons(
  row: any,
  role: string,
  onConfirm?: (id: string) => void,
  onBorrowing?: (id: string) => void,
  onCancel?: (id: string) => void,
  onReturn?: (loan: any) => void,
) {
  if (role !== 'MANAGER') {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>;
  }

  switch (row.status) {
    case 'PENDING':
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onConfirm?.(row.id)} className="btn btn-primary" style={btnStyle}>Xác nhận</button>
          <button onClick={() => onCancel?.(row.id)} className="btn btn-danger" style={btnStyle}>Hủy</button>
        </div>
      );
    case 'PENDING_PAYMENT':
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onBorrowing?.(row.id)} className="btn btn-success" style={btnStyle}>Đã thanh toán</button>
          <button onClick={() => onCancel?.(row.id)} className="btn btn-danger" style={btnStyle}>Hủy</button>
        </div>
      );
    case 'BORROWING':
    case 'OVERDUE':
      return <button onClick={() => onReturn?.(row)} className="btn btn-success" style={btnStyle}>Trả sách</button>;
    default:
      return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>;
  }
}

export default function LoanTable({
  loans, loading, role, onConfirm, onBorrowing, onCancel, onReturn,
}: {
  loans: any[];
  loading: boolean;
  role: 'USER' | 'MANAGER';
  onConfirm?: (id: string) => void;
  onBorrowing?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReturn?: (loan: any) => void;
}) {
  const columns = [
    { key: 'memberName', label: 'Độc giả', render: (row: any) => row.userName },
    { key: 'bookTitles', label: 'Sách', render: (row: any) => row.bookTitles },
    { key: 'requestDate', label: 'Ngày mượn', render: (row: any) => row.requestDate || '—' },
    { key: 'dueDate', label: 'Hạn trả', render: (row: any) => row.dueDate || '—' },
    { key: 'status', label: 'Trạng thái', render: (row: any) => statusBadge(row.status) },
    { key: 'actions', label: 'Hành động', render: (row: any) => actionButtons(row, role, onConfirm, onBorrowing, onCancel, onReturn) },
  ];

  return <Table columns={columns} data={loans} loading={loading} emptyText="Không có phiếu mượn nào" />;
}