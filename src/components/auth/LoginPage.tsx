'use client';

export default function LoginPage({
  authMode, setAuthMode, authError, setAuthError,
  loginUser, setLoginUser, loginPass, setLoginPass,
  regData, setRegData, authSubmitting, handleLogin, handleRegister,
}: any) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>THƯ VIỆN <span className="gradient-text">SỐ</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {authMode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {authError && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: authError.includes('thành công') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: authError.includes('thành công') ? 'var(--success)' : 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input className="form-control" placeholder="Nhập username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input className="form-control" type="password" placeholder="Nhập mật khẩu" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={authSubmitting} style={{ marginTop: '8px' }}>
              {authSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Chưa có tài khoản?{' '}
              <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
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
            <div className="form-group">
              <label>Vai trò</label>
              <select className="form-control" value={regData.role} onChange={(e) => setRegData({ ...regData, role: e.target.value })} style={{ background: 'var(--bg-tertiary)' }}>
                <option value="MEMBER">Độc giả</option>
                <option value="LIBRARIAN">Thủ thư</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={authSubmitting} style={{ marginTop: '8px' }}>
              {authSubmitting ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Đăng nhập
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
