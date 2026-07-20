'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailApi, resendVerificationEmailApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

type Status = 'verifying' | 'success' | 'error' | 'expired';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  const doVerify = useCallback(async () => {
    if (!token) { setStatus('error'); setMessage('Token xác thực không hợp lệ.'); return; }
    try {
      const result = await verifyEmailApi(token);
      setStatus('success');
      setMessage(result.message || 'Xác thực email thành công!');
    } catch (err: any) {
      const msg = err.message || 'Xác thực thất bại';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('hết hạn')) {
        setStatus('expired');
        setMessage('Token xác thực đã hết hạn. Vui lòng nhập email để gửi lại.');
      } else {
        setStatus('error');
        setMessage(msg);
      }
    }
  }, [token]);

  useEffect(() => { doVerify(); }, [doVerify]);

  const handleResend = async () => {
    if (!resendEmail.trim()) { setMessage('Vui lòng nhập email'); return; }
    setResending(true);
    try {
      const result = await resendVerificationEmailApi(resendEmail.trim());
      setMessage(result.message || 'Nếu email tồn tại, email xác thực đã được gửi.');
    } catch (err: any) {
      setMessage(err.message || 'Gửi lại email thất bại');
    }
    setResending(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <Spinner />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Đang xác thực email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Xác Thực Thành Công</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>{message}</p>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Đăng Nhập Ngay
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏰</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Token Đã Hết Hạn</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>{message}</p>
            <div className="form-group">
              <input className="form-control" type="email" placeholder="Nhập email của bạn" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
            </div>
            <button onClick={handleResend} className="btn btn-primary btn-full" disabled={resending}>
              {resending ? 'Đang gửi...' : 'Gửi Lại Email Xác Thực'}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>Xác Thực Thất Bại</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>{message}</p>
            <Link href="/" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
              Về trang chủ
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Spinner />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
