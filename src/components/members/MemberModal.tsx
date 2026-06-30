'use client';

import Modal from '@/components/ui/Modal';
import MemberForm from './MemberForm';

interface MemberModalProps {
  open: boolean;
  member?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  loading?: boolean;
}

export default function MemberModal({ open, member, onClose, onSubmit, loading }: MemberModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} title={member ? 'Cập nhật độc giả' : 'Thêm độc giả'} onClose={onClose}>
      <MemberForm initialData={member} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
    </Modal>
  );
}
