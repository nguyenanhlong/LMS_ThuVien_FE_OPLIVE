'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getSubCategoriesApi } from '@/lib/api';

export default function BookForm({ initialData, onSubmit, onCancel, loading }: any) {
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    sub_category_id: '',
    title: '',
    isbn: '',
    author: '',
    image_url: '',
    publisher: '',
    publisher_year: new Date().getFullYear(),
    description: '',
    total_quantity: 1,
    max_borrow_days: 14,
    deposit_amount: 0,
    fine_per_day: 0,
    replacement_cost: 0,
    fee_per_day: 0,
    fee_per_week: 0,
    fee_per_month: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getSubCategoriesApi();
        setSubCategories(Array.isArray(data) ? data : (data as any)?.items || []);
      } catch { setSubCategories([]); }
    })();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        sub_category_id: String(initialData.sub_category_id ?? ''),
        title: initialData.title || '',
        isbn: initialData.isbn || '',
        author: initialData.author || '',
        image_url: initialData.image_url || '',
        publisher: initialData.publisher || '',
        publisher_year: initialData.publisher_year || new Date().getFullYear(),
        description: initialData.description || '',
        total_quantity: initialData.total_quantity ?? 1,
        max_borrow_days: initialData.max_borrow_days ?? 14,
        deposit_amount: initialData.deposit_amount ?? 0,
        fine_per_day: initialData.fine_per_day ?? 0,
        replacement_cost: initialData.replacement_cost ?? 0,
        fee_per_day: initialData.fee_per_day ?? 0,
        fee_per_week: initialData.fee_per_week ?? 0,
        fee_per_month: initialData.fee_per_month ?? 0,
      });
    }
  }, [initialData]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      sub_category_id: Number(form.sub_category_id),
      publisher_year: Number(form.publisher_year),
      total_quantity: Number(form.total_quantity),
      max_borrow_days: Number(form.max_borrow_days),
      deposit_amount: Number(form.deposit_amount),
      fine_per_day: Number(form.fine_per_day),
      replacement_cost: Number(form.replacement_cost),
      fee_per_day: Number(form.fee_per_day),
      fee_per_week: Number(form.fee_per_week),
      fee_per_month: Number(form.fee_per_month),
    };
    if (!payload.isbn) delete payload.isbn;
    onSubmit(payload);
  };

  const row = { display: 'flex', gap: 12 } as const;

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="book-subcat">Thể loại *</label>
        <select
          id="book-subcat" className="form-control" required
          value={form.sub_category_id}
          onChange={(e) => set('sub_category_id', e.target.value)}
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <option value="">-- Chọn thể loại --</option>
          {subCategories.map((sc: any) => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </select>
      </div>

      <Input label="Tên sách *" required value={form.title} onChange={(e: any) => set('title', e.target.value)} id="book-title" />

      <div style={row}>
        <div style={{ flex: 1 }}>
          <Input label="Tác giả" value={form.author} onChange={(e: any) => set('author', e.target.value)} id="book-author" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="ISBN-13" value={form.isbn} onChange={(e: any) => set('isbn', e.target.value)} id="book-isbn" placeholder="Có thể để trống" />
        </div>
      </div>

      <div style={row}>
        <div style={{ flex: 2 }}>
          <Input label="Nhà xuất bản" value={form.publisher} onChange={(e: any) => set('publisher', e.target.value)} id="book-publisher" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Năm XB" type="number" value={form.publisher_year} onChange={(e: any) => set('publisher_year', e.target.value)} id="book-year" />
        </div>
      </div>

      <Input label="Ảnh bìa (URL)" value={form.image_url} onChange={(e: any) => set('image_url', e.target.value)} id="book-image" placeholder="https://..." />

      <div style={row}>
        <div style={{ flex: 1 }}>
          <Input label="Tổng số lượng *" type="number" min={0} required value={form.total_quantity} onChange={(e: any) => set('total_quantity', e.target.value)} id="book-qty" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Số ngày mượn tối đa" type="number" min={1} value={form.max_borrow_days} onChange={(e: any) => set('max_borrow_days', e.target.value)} id="book-days" />
        </div>
      </div>

      <h4 style={{ margin: '20px 0 12px', fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
        Chi phí (VNĐ)
      </h4>

      <div style={row}>
        <div style={{ flex: 1 }}>
          <Input label="Tiền cọc" type="number" min={0} value={form.deposit_amount} onChange={(e: any) => set('deposit_amount', e.target.value)} id="book-deposit" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Phạt / ngày trễ" type="number" min={0} value={form.fine_per_day} onChange={(e: any) => set('fine_per_day', e.target.value)} id="book-fine" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Phí thay sách mất" type="number" min={0} value={form.replacement_cost} onChange={(e: any) => set('replacement_cost', e.target.value)} id="book-replace" />
        </div>
      </div>

      <div style={row}>
        <div style={{ flex: 1 }}>
          <Input label="Phí thuê / ngày" type="number" min={0} value={form.fee_per_day} onChange={(e: any) => set('fee_per_day', e.target.value)} id="book-fee-d" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Phí thuê / tuần" type="number" min={0} value={form.fee_per_week} onChange={(e: any) => set('fee_per_week', e.target.value)} id="book-fee-w" />
        </div>
        <div style={{ flex: 1 }}>
          <Input label="Phí thuê / tháng" type="number" min={0} value={form.fee_per_month} onChange={(e: any) => set('fee_per_month', e.target.value)} id="book-fee-m" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="book-desc">Mô tả</label>
        <textarea className="form-control" id="book-desc" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} type="button">Hủy bỏ</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {initialData ? 'Lưu Thay Đổi' : 'Thêm Sách'}
        </Button>
      </div>
    </form>
  );
}