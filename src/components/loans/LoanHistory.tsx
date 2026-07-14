'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { LOAN_STATUS_MAP } from './LoanTable';

export default function LoanHistory({ loans, loading }: {
  loans: any[];
  loading: boolean;
}) {
  const columns = [
    { key: 'memberName', label: 'Độc giả', render: (row: any) => row.userName },
    { key: 'bookTitles', label: 'Sách', render: (row: any) => row.bookTitles },
    { key: 'requestDate', label: 'Ngày mượn' },
    { key: 'returnDate', label: 'Ngày trả', render: (row: any) => row.returnDate || '-' },
    {
      key: 'status', label: 'Trạng thái',
      render: (row: any) => {
        const s = LOAN_STATUS_MAP[row.status] || { label: row.status, variant: 'muted' };
        return <Badge variant={s.variant}>{s.label}</Badge>;
      },
    },
  ];

  return <Table columns={columns} data={loans} loading={loading} emptyText="Chưa có lịch sử mượn trả" />;
}