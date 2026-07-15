'use client';

import { useState, useEffect, useRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getCategoriesApi, getSubCategoriesApi } from '@/lib/api';

export default function BookForm({ initialData, onSubmit, onCancel, loading }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [fetchingSubs, setFetchingSubs] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
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
        const data = await getCategoriesApi();
        setCategories(Array.isArray(data) ? data : (data as any)?.items || []);
      } catch { setCategories([]); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCatId) { setSubCategories([]); set('sub_category_id', ''); return; }
    setFetchingSubs(true);
    (async () => {
      try {
        const data = await getSubCategoriesApi(Number(selectedCatId));
        const list = Array.isArray(data) ? data : (data as any)?.items || [];
        setSubCategories(list);
        set('sub_category_id', list.length > 0 ? String(list[0].id) : '');
      } catch { setSubCategories([]); set('sub_category_id', ''); }
      setFetchingSubs(false);
    })();
  }, [selectedCatId]);

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
      if (initialData.sub_category_id) {
        (async () => {
          try {
            const allSubs = await getSubCategoriesApi();
            const subs = Array.isArray(allSubs) ? allSubs : (allSubs as any)?.items || [];
            const match = subs.find((s: any) => s.id === initialData.sub_category_id);
            if (match) setSelectedCatId(String(match.category_id));
          } catch { }
        })();
      }
    }
  }, [initialData]);

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

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
    onSubmit({ ...payload, _file: file });
  };

  const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' } as const;

  return (
    <form onSubmit={handleSubmit} style={grid}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label htmlFor="book-cat">Danh mục *</label>
          <select
            id="book-cat" className="form-control" required
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {fetchingSubs && <small style={{ color: 'var(--text-secondary)' }}>Đang tải...</small>}
        </div>

        <Input label="Tên sách *" required value={form.title} onChange={(e: any) => set('title', e.target.value)} id="book-title" />

        <Input label="Tác giả" value={form.author} onChange={(e: any) => set('author', e.target.value)} id="book-author" />

        <Input label="ISBN-13" value={form.isbn} onChange={(e: any) => set('isbn', e.target.value)} id="book-isbn" placeholder="Có thể để trống" />

        <Input label="Nhà xuất bản" value={form.publisher} onChange={(e: any) => set('publisher', e.target.value)} id="book-publisher" />

        <Input label="Năm XB" type="number" value={form.publisher_year} onChange={(e: any) => set('publisher_year', e.target.value)} id="book-year" />

        <div className="form-group">
          <label>Ảnh bìa</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="form-control" style={{ background: 'var(--bg-tertiary)' }} />
        </div>
        <Input label="Hoặc nhập URL ảnh" value={form.image_url} onChange={(e: any) => { set('image_url', e.target.value); if (e.target.value) setFile(null); }} id="book-image" placeholder="https://..." />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Tổng số lượng *" type="number" min={0} required value={form.total_quantity} onChange={(e: any) => set('total_quantity', e.target.value)} id="book-qty" />

        <Input label="Số ngày mượn tối đa" type="number" min={1} value={form.max_borrow_days} onChange={(e: any) => set('max_borrow_days', e.target.value)} id="book-days" />

        <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Chi phí (VNĐ)
        </h4>

        <Input label="Tiền cọc" type="number" min={0} value={form.deposit_amount} onChange={(e: any) => set('deposit_amount', e.target.value)} id="book-deposit" />

        <Input label="Phạt / ngày trễ" type="number" min={0} value={form.fine_per_day} onChange={(e: any) => set('fine_per_day', e.target.value)} id="book-fine" />

        <Input label="Phí thay sách mất" type="number" min={0} value={form.replacement_cost} onChange={(e: any) => set('replacement_cost', e.target.value)} id="book-replace" />

        <Input label="Phí thuê / ngày" type="number" min={0} value={form.fee_per_day} onChange={(e: any) => set('fee_per_day', e.target.value)} id="book-fee-d" />

        <Input label="Phí thuê / tuần" type="number" min={0} value={form.fee_per_week} onChange={(e: any) => set('fee_per_week', e.target.value)} id="book-fee-w" />

        <Input label="Phí thuê / tháng" type="number" min={0} value={form.fee_per_month} onChange={(e: any) => set('fee_per_month', e.target.value)} id="book-fee-m" />

        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="book-desc">Mô tả</label>
          <textarea className="form-control" id="book-desc" rows={4} style={{ height: 'calc(100% - 22px)', resize: 'none' }} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <Button variant="secondary" onClick={onCancel} type="button">Hủy bỏ</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {initialData ? 'Lưu Thay Đổi' : 'Thêm Sách'}
        </Button>
      </div>
    </form>
  );
}