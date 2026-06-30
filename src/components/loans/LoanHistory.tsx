'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

export default function LoanHistory({ loans, loading }: {
  loans: any[];
  loading: boolean;
}) {
  const columns = [
    { key: 'memberName', label: 'Độc giả', render: (row: any) => row.userName },
    { key: 'bookTitle', label: 'Tên sách', render: (row: any) => row.book?.title || 'Đầu sách đã bị xóa' },
    { key: 'requestDate', label: 'Ngày mượn' },
    { key: 'returnDate', label: 'Ngày trả', render: (row: any) => row.returnDate || '-' },
    { key: 'status', label: 'Trạng thái', render: () => <Badge variant="muted">Đã trả</Badge> },
  ];

  return <Table columns={columns} data={loans} loading={loading} emptyText="Chưa có lịch sử mượn trả" />;
}
