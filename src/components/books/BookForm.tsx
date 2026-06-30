'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const allCategories = ['Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính', 'Lịch sử', 'Văn học'];

export default function BookForm({ initialData, onSubmit, onCancel, loading }: any) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Kỹ năng sống');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setCategory(initialData.category || 'Kỹ năng sống');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, author, category, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Tên Đầu Sách" required placeholder="Nhập tên sách" value={title} onChange={(e: any) => setTitle(e.target.value)} id="book-title" />
      <Input label="Tác Giả" required placeholder="Nhập tên tác giả" value={author} onChange={(e: any) => setAuthor(e.target.value)} id="book-author" />
      <div className="form-group">
        <label htmlFor="book-category">Thể Loại</label>
        <select className="form-control" id="book-category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ background: 'var(--bg-tertiary)' }}>
          {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="book-desc">Mô Tả Nội Dung</label>
        <textarea className="form-control" id="book-desc" rows={4} placeholder="Nhập tóm tắt hoặc giới thiệu sách" value={description} onChange={(e: any) => setDescription(e.target.value)} />
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} type="button">Hủy bỏ</Button>
        <Button variant="primary" type="submit" disabled={loading}>{initialData ? 'Lưu Thay Đổi' : 'Thêm Sách'}</Button>
      </div>
    </form>
  );
}
