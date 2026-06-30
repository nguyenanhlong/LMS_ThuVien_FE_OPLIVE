'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface MemberFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function MemberForm({ initialData, onSubmit, onCancel, loading }: MemberFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setEmail(initialData.email ?? '');
      setPhone(initialData.phone ?? '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Tên độc giả" id="name" value={name} onChange={(e: any) => setName(e.target.value)} required />
      <Input label="Email" id="email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
      <Input label="Số điện thoại" id="phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Hủy</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </div>
    </form>
  );
}
