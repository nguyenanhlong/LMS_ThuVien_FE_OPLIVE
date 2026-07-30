'use client';

export default function Toast({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-dot" />
      <span>{message}</span>
    </div>
  );
}
