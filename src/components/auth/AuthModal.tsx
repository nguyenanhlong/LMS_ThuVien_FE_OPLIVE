'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { resendVerificationEmailApi } from '@/lib/api';
import { CloseIcon } from '@/components/ui/icons';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regData, setRegData] = useState({ username: '', full_name: '', email: '', password: '' });

  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginUser || !loginPass) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setSubmitting(true);
    try {
      await login(loginUser, loginPass);
    } catch (err: any) {
      const msg = err.message || 'Đăng nhập thất bại';
      if (msg.toLowerCase().includes('verify your email')) {
        setMode('login');
        setLoginUser(loginUser);
        setError('Tài khoản chưa xác thực email. Vui lòng kiểm tra email hoặc đăng ký lại.');
      } else {
        setError(msg);
      }
    }
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { username, full_name, email, password } = regData;
    if (!username || !full_name || !email || !password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setSubmitting(true);
    try {
      await register(regData);
      setRegisteredEmail(email);
    } catch (err: any) { setError(err.message || 'Đăng ký thất bại'); }
    setSubmitting(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await resendVerificationEmailApi(registeredEmail);
      setError('Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.');
      setTimeout(() => setError(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Gửi lại email thất bại');
    }
    setResending(false);
  };

  const toggleMode = () => { setMode(mode === 'login' ? 'register' : 'login'); setRegisteredEmail(''); setError(''); };

  if (registeredEmail) {
    return (
      <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-content glass-panel" style={{ maxWidth: '420px', padding: '40px' }}>
          <button onClick={onClose} className="modal-close" style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <CloseIcon />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📧</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Xác Thực Email</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.6' }}>
              Chúng tôi đã gửi email xác thực đến <strong style={{ color: 'var(--text-primary)' }}>{registeredEmail}</strong>.
              Vui lòng kiểm tra hộp thư và nhấp vào liên kết để kích hoạt tài khoản.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: error.includes('gửi lại') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: error.includes('gửi lại') ? 'var(--success)' : 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button onClick={handleResendVerification} className="btn btn-secondary" disabled={resending} style={{ marginBottom: '12px' }}>
              {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Đã xác thực?{' '}
              <button onClick={() => { setRegisteredEmail(''); setMode('login'); setError(''); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel" style={{ maxWidth: '420px', padding: '40px' }}>
        <button onClick={onClose} className="modal-close" style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <CloseIcon />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>THƯ VIỆN <span className="gradient-text">SỐ</span></h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {mode === 'login' ? 'Đăng nhập để mượn sách' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: error.includes('thành công') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: error.includes('thành công') ? 'var(--success)' : 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input className="form-control" placeholder="Nhập username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input className="form-control" type="password" placeholder="Nhập mật khẩu" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: '8px' }}>
              {submitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Chưa có tài khoản?{' '}
              <button type="button" onClick={toggleMode} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Đăng ký
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input className="form-control" placeholder="username" value={regData.username} onChange={(e) => setRegData({ ...regData, username: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label>Họ và tên</label>
              <input className="form-control" placeholder="Nguyễn Văn A" value={regData.full_name} onChange={(e) => setRegData({ ...regData, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" placeholder="email@example.com" value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input className="form-control" type="password" placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt" value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: '8px' }}>
              {submitting ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Đã có tài khoản?{' '}
              <button type="button" onClick={toggleMode} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Đăng nhập
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
