'use client';

import Badge from '@/components/ui/Badge';

const LOAN_STATUS_MAP: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'warning' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán tại quầy', variant: 'warning' },
  BORROWING: { label: 'Đang mượn', variant: 'success' },
  COMPLETED: { label: 'Hoàn tất', variant: 'muted' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const LOAN_DETAIL_STATUS_MAP: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'warning' },
  BORROWING: { label: 'Đang mượn', variant: 'success' },
  OVERDUE: { label: 'Quá hạn', variant: 'danger' },
  RETURNED: { label: 'Đã trả', variant: 'muted' },
  CANCELLED: { label: 'Đã hủy', variant: 'muted' },
};

export function LoanStatusBadge({ status }: { status: string }) {
  const s = LOAN_STATUS_MAP[status] || { label: status, variant: 'muted' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function LoanDetailStatusBadge({ status }: { status: string }) {
  const s = LOAN_DETAIL_STATUS_MAP[status] || { label: status, variant: 'muted' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function canCancelLoan(status: string) {
  return status === 'PENDING' || status === 'PENDING_PAYMENT';
}
