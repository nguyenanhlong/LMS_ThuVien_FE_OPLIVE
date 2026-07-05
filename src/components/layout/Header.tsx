'use client';



interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

export default function Header({
  onToggleSidebar,
  role,
  user,
  onLogout,
}: {
  onToggleSidebar?: () => void;
  role: 'USER' | 'MANAGER';
  user?: UserInfo | null;
  onLogout?: () => void;
}) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </button>
          <div className="logo">
            THƯ VIỆN <span className="gradient-text">SỐ</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {user?.full_name || user?.username} ({role === 'MANAGER' ? 'Quản Thủ' : 'Độc Giả'})
          </span>
          {onLogout && (
            <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem', cursor: 'pointer' }}>
              Thoát
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
