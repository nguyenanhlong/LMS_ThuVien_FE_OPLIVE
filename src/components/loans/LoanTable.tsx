'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: string }> = {
    PENDING: { label: 'Chờ xác nhận trả', variant: 'info' },
    APPROVED: { label: 'Đang mượn', variant: 'success' },
    REJECTED: { label: 'Đã từ chối', variant: 'danger' },
    RETURNED: { label: 'Đã trả', variant: 'muted' },
    BORROWING: { label: 'Đang mượn', variant: 'success' },
    OVERDUE: { label: 'Quá hạn', variant: 'danger' },
    CANCELLED: { label: 'Đã hủy', variant: 'muted' },
  };
  const s = map[status] || { label: status, variant: 'muted' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function actionButtons(row: any, role: string, onApprove?: (id: string) => void, onReject?: (id: string) => void, onReturn?: (loan: any) => void) {
  const status = row.status;

  if (role === 'MANAGER') {
    if (status === 'PENDING') {
      return (
        <button onClick={() => onReturn?.(row)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Xác Nhận Trả</button>
      );
    }
    if (status === 'APPROVED' || status === 'OVERDUE') {
      return (
        <button onClick={() => onReturn?.(row)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Thu Hồi</button>
      );
    }
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>;
  }

  if (role === 'USER') {
    if (status === 'APPROVED') {
      return (
        <button onClick={() => onReturn?.(row)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>Trả Sách</button>
      );
    }
    if (status === 'PENDING') {
      return <span style={{ color: '#fbbf24', fontSize: '0.875rem' }}>Đang chờ xử lý</span>;
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
  onReject?: (id: string) => void;
  onReturn?: (id: string) => void;
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
