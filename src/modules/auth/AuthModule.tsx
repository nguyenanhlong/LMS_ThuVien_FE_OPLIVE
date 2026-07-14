'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModule() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regData, setRegData] = useState({ username: '', full_name: '', email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginUser || !loginPass) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setSubmitting(true);
    try {
      await login(loginUser, loginPass);
    } catch (err: any) { setError(err.message || 'Đăng nhập thất bại'); }
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
      setMode('login');
      setLoginUser(username);
      setError('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err: any) { setError(err.message || 'Đăng ký thất bại'); }
    setSubmitting(false);
  };

  const toggleMode = () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>THƯ VIỆN <span className="gradient-text">SỐ</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
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
