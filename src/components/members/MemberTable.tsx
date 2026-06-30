'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Member {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  joinDate?: string;
  status?: string;
}

interface MemberTableProps {
  members: Member[];
  loading?: boolean;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export default function MemberTable({ members, loading, onEdit, onDelete }: MemberTableProps) {
  const columns = [
    { key: 'name', label: 'Tên độc giả' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Số điện thoại', render: (row: Member) => row.phone || '—' },
    { key: 'joinDate', label: 'Ngày tham gia', render: (row: Member) => row.joinDate || '—' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: Member) => {
        const st = row.status?.toLowerCase();
        const variant = st === 'active' ? 'success' : st === 'inactive' ? 'danger' : 'muted';
        return <Badge variant={variant}>{st === 'active' ? 'Hoạt động' : st === 'inactive' ? 'Ngưng' : row.status || '—'}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row: Member) => (
        <div className="table-actions">
          <Button variant="warning" onClick={() => onEdit(row)} id={`edit-${row.id}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Sửa
          </Button>
          <Button variant="danger" onClick={() => onDelete(row)} id={`delete-${row.id}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={members} loading={loading} emptyText="Chưa có độc giả nào" />;
}
