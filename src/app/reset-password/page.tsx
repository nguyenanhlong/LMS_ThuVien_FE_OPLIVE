'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

type Status = 'idle' | 'success' | 'error';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Token đặt lại mật khẩu không hợp lệ.'); }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setMessage('Mật khẩu xác nhận không khớp'); return; }
    setSubmitting(true);
    try {
      const result = await resetPasswordApi(token, newPassword, confirmPassword);
      setStatus('success');
      setMessage(result.message || 'Đặt lại mật khẩu thành công!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Đặt lại mật khẩu thất bại');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        {status === 'success' ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Đặt Lại Mật Khẩu Thành Công</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>{message}</p>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Đăng Nhập Ngay
            </Link>
          </>
        ) : status === 'error' && !token ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Liên Kết Không Hợp Lệ</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>{message}</p>
            <Link href="/" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
              Về trang chủ
            </Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔑</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Đặt Lại Mật Khẩu</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Nhập mật khẩu mới cho tài khoản của bạn.</p>

            {message && (
              <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: message.includes('không khớp') ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.1)', color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input className="form-control" type="password" placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input className="form-control" type="password" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: '8px' }}>
                {submitting ? 'Đang đặt lại...' : 'Đặt Lại Mật Khẩu'}
              </button>
            </form>

            {status === 'error' && (
              <p style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <Link href="/" style={{ color: 'var(--primary)' }}>Về trang chủ</Link>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Spinner />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
