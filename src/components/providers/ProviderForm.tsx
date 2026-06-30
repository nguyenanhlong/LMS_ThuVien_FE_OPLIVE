'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ProviderFormProps {
  initialData?: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  onSubmit: (data: {
    name: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ProviderForm({ initialData, onSubmit, onCancel, loading }: ProviderFormProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setContact(initialData.contact ?? '');
      setEmail(initialData.email ?? '');
      setPhone(initialData.phone ?? '');
      setAddress(initialData.address ?? '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, contact, email, phone, address });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Tên nhà cung cấp" id="name" value={name} onChange={(e: any) => setName(e.target.value)} required />
      <Input label="Người liên hệ" id="contact" value={contact} onChange={(e: any) => setContact(e.target.value)} />
      <Input label="Email" id="email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
      <Input label="Số điện thoại" id="phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
      <Input label="Địa chỉ" id="address" value={address} onChange={(e: any) => setAddress(e.target.value)} />
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Hủy</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </div>
    </form>
  );
}
