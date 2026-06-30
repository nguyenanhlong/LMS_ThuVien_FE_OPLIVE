'use client';

import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', cancelText = 'Hủy' }: any) {
  if (!open) return null;

  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-muted" onClick={onCancel} type="button">{cancelText}</button>
        <button className="btn btn-danger" onClick={onConfirm} type="button">{confirmText}</button>
      </div>
    </Modal>
  );
}
