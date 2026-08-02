'use client';

import { useState, useEffect, useRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import MoneyInput from '@/components/ui/MoneyInput';
import { getCategoriesApi, getSubCategoriesApi } from '@/lib/api';
import { resolveImageUrl } from '@/utils/mappers';

const sectionTitle: React.CSSProperties = {
  margin: '0 0 18px',
  fontSize: '0.78rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--primary)',
  borderBottom: '1px solid var(--border)',
  paddingBottom: 8,
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0 18px',
  alignItems: 'start',
};

const spanFull: React.CSSProperties = { gridColumn: '1 / -1' };

export default function BookForm({ initialData, onSubmit, onCancel, loading }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingSubCatRef = useRef<string>('');
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
        const pre = pendingSubCatRef.current;
        const stillValid = pre && list.some((s: any) => s.id === Number(pre));
        set('sub_category_id', stillValid ? pre : (list.length > 0 ? String(list[0].id) : ''));
        if (pre) pendingSubCatRef.current = '';
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
      setPreview(initialData.image_url ? resolveImageUrl(initialData.image_url) : '');
      if (initialData.sub_category_id) {
        pendingSubCatRef.current = String(initialData.sub_category_id);
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

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

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
    };
    if (!payload.isbn) delete payload.isbn;
    else if (initialData && payload.isbn === initialData.isbn) delete payload.isbn;
    onSubmit({ ...payload, _file: file });
  };

  return (
    <form onSubmit={handleSubmit} style={grid}>
      <div style={spanFull}>
        <h4 style={sectionTitle}>Thông tin chung</h4>
      </div>

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

      <div className="form-group">
        <label htmlFor="book-subcat">Danh mục con *</label>
        <select
          id="book-subcat" className="form-control" required
          value={form.sub_category_id}
          onChange={(e) => set('sub_category_id', e.target.value)}
          disabled={!selectedCatId || fetchingSubs}
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <option value="">{fetchingSubs ? 'Đang tải...' : '-- Chọn danh mục con --'}</option>
          {subCategories.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <Input label="Tên sách *" required value={form.title} onChange={(e: any) => set('title', e.target.value)} id="book-title" />
      <Input label="Tác giả" value={form.author} onChange={(e: any) => set('author', e.target.value)} id="book-author" />

      <Input label="ISBN-13" value={form.isbn} onChange={(e: any) => set('isbn', e.target.value)} id="book-isbn" placeholder="Có thể để trống" />
      <Input label="Nhà xuất bản" value={form.publisher} onChange={(e: any) => set('publisher', e.target.value)} id="book-publisher" />

      <Input label="Năm xuất bản" type="number" min={0} value={form.publisher_year} onChange={(e: any) => set('publisher_year', e.target.value)} id="book-year" />
      <Input label="Tổng số lượng *" type="number" min={0} required value={form.total_quantity} onChange={(e: any) => set('total_quantity', e.target.value)} id="book-qty" />

      <Input label="Số ngày mượn tối đa" type="number" min={1} value={form.max_borrow_days} onChange={(e: any) => set('max_borrow_days', e.target.value)} id="book-days" />

      <div className="form-group">
        <label>Ảnh bìa</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="form-control" style={{ background: 'var(--bg-tertiary)' }} />
      </div>

      <div style={spanFull}>
        <h4 style={sectionTitle}>Chi phí (VNĐ)</h4>
      </div>

      <MoneyInput label="Tiền cọc" value={form.deposit_amount} onChange={(v: number) => set('deposit_amount', v)} id="book-deposit" />
      <MoneyInput label="Phạt / ngày trễ" value={form.fine_per_day} onChange={(v: number) => set('fine_per_day', v)} id="book-fine" />

      <MoneyInput label="Phí thay sách mất" value={form.replacement_cost} onChange={(v: number) => set('replacement_cost', v)} id="book-replace" />
      <MoneyInput label="Phí thuê / ngày" value={form.fee_per_day} onChange={(v: number) => set('fee_per_day', v)} id="book-fee-d" />

      <MoneyInput label="Phí thuê / tuần" value={form.fee_per_week} onChange={(v: number) => set('fee_per_week', v)} id="book-fee-w" />
      <MoneyInput label="Phí thuê / tháng" value={form.fee_per_month} onChange={(v: number) => set('fee_per_month', v)} id="book-fee-m" />

      <div style={spanFull}>
        <h4 style={sectionTitle}>Hình ảnh & Mô tả</h4>
      </div>

      <div className="form-group">
        <label htmlFor="book-image">Hoặc nhập URL ảnh</label>
        <input
          id="book-image" className="form-control" value={form.image_url}
          onChange={(e: any) => { set('image_url', e.target.value); if (e.target.value) setFile(null); }}
          placeholder="https://..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="book-desc">Mô tả</label>
        <textarea className="form-control" id="book-desc" rows={3} style={{ resize: 'none', height: 96 }} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      {preview && (
        <div style={spanFull}>
          <img src={preview} alt="Preview" style={{ maxWidth: 120, maxHeight: 160, borderRadius: 8, border: '1px solid var(--border)' }} />
        </div>
      )}

      <div style={{ ...spanFull, display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <Button variant="secondary" onClick={onCancel} type="button">Hủy bỏ</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : (initialData ? 'Lưu Thay Đổi' : 'Thêm Sách')}
        </Button>
      </div>
    </form>
  );
}
