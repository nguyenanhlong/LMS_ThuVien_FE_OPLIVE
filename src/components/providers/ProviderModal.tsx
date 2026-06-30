'use client';

import Modal from '@/components/ui/Modal';
import ProviderForm from './ProviderForm';

interface ProviderModalProps {
  open: boolean;
  provider?: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
  }) => void;
  loading?: boolean;
}

export default function ProviderModal({ open, provider, onClose, onSubmit, loading }: ProviderModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} title={provider ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp'} onClose={onClose}>
      <ProviderForm initialData={provider} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
    </Modal>
  );
}
