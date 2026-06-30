'use client';

export default function Header({
  onToggleSidebar,
  role,
  onRoleChange,
}: {
  onToggleSidebar?: () => void;
  role: 'USER' | 'MANAGER';
  onRoleChange: (role: 'USER' | 'MANAGER') => void;
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
        <div className="role-switcher">
          <button
            onClick={() => onRoleChange('USER')}
            className={`role-btn ${role === 'USER' ? 'active' : ''}`}
            id="btn-role-user"
          >
            Người Đọc
          </button>
          <button
            onClick={() => onRoleChange('MANAGER')}
            className={`role-btn ${role === 'MANAGER' ? 'active' : ''}`}
            id="btn-role-manager"
          >
            Quản Thủ
          </button>
        </div>
      </div>
    </header>
  );
}
