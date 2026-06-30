'use client';

import Modal from '@/components/ui/Modal';
import BookForm from './BookForm';

export default function BookModal({ open, book, onClose, onSubmit, loading }: any) {
  return (
    <Modal
      open={open}
      title={book ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Đầu Sách Mới'}
      subtitle={book ? 'Cập nhật thông tin đầu sách' : 'Bổ sung sách vào kho thư viện'}
      onClose={onClose}
    >
      <BookForm initialData={book} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
    </Modal>
  );
}
