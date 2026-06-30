'use client';

import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';

interface Provider {
  id: string | number;
  name: string;
  contact?: string;
  email: string;
  phone?: string;
  address?: string;
}

interface ProviderTableProps {
  providers: Provider[];
  loading?: boolean;
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
}

export default function ProviderTable({ providers, loading, onEdit, onDelete }: ProviderTableProps) {
  const columns = [
    { key: 'name', label: 'Tên nhà cung cấp' },
    { key: 'contact', label: 'Người liên hệ', render: (row: Provider) => row.contact || '—' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Số điện thoại', render: (row: Provider) => row.phone || '—' },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row: Provider) => (
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

  return <Table columns={columns} data={providers} loading={loading} emptyText="Chưa có nhà cung cấp nào" />;
}
