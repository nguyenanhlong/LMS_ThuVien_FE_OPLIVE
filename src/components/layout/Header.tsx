'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { resolveImageUrl } from '@/utils/mappers';
import { useTheme } from '@/context/ThemeContext';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar?: string;
  role: string;
}

export interface HeaderNavDropdownItem {
  key: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface HeaderNavItem {
  key: string;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
  dropdown?: HeaderNavDropdownItem[];
}

export default function Header({
  onToggleSidebar,
  role,
  user,
  onLogout,
  onLoginRequest,
  onGoToProfile,
  onGoToFavorites,
  navItems,
  searchTerm,
  onSearchChange,
  extraActions,
}: {
  onToggleSidebar?: () => void;
  role: 'USER' | 'MANAGER';
  user?: UserInfo | null;
  onLogout?: () => void;
  onLoginRequest?: () => void;
  onGoToProfile?: () => void;
  onGoToFavorites?: () => void;
  navItems?: HeaderNavItem[];
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  extraActions?: ReactNode;
}) {
  const { mode, theme, toggleTheme } = useTheme();
  const [themeToast, setThemeToast] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initial = user ? (user?.full_name || user?.username || '?').trim().charAt(0).toUpperCase() : '?';
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openKey) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openKey]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

  const handleNavClick = (item: HeaderNavItem) => {
    if (item.dropdown) {
      setOpenKey(openKey === item.key ? null : item.key);
    } else {
      item.onClick();
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
    const labels: Record<string, string> = { dark: '🌙 Chế độ Tối', light: '☀️ Chế độ Sáng', auto: '🔄 Tự động đổi ' };
    const next: Record<string, string> = { dark: 'light', light: 'auto', auto: 'dark' };
    setThemeToast(labels[next[mode]]);
    setTimeout(() => setThemeToast(''), 2500);
  };

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="header-left">
            {!navItems && (
              <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </svg>
              </button>
            )}
            <div className="brand">
              <span className="brand-icon">📖</span>
              <div className="brand-text">
                <span className="brand-title">THƯ VIỆN <span className="gradient-text">SỐ</span></span>
                <span className="brand-subtitle">Thư viện đọc sách trực tuyến</span>
              </div>
            </div>

            {navItems && (
              <nav className="header-nav" ref={navRef}>
                {navItems.map((item) => (
                  <div key={item.key} className="header-nav-item">
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`header-nav-link ${item.active ? 'active' : ''}`}
                      aria-expanded={item.dropdown ? openKey === item.key : undefined}
                    >
                      {item.label}
                      {!!item.badge && <span className="header-nav-badge">{item.badge}</span>}
                      {item.dropdown && (
                        <svg
                          className={`header-nav-chevron ${openKey === item.key ? 'open' : ''}`}
                          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      )}
                    </button>
                    {item.dropdown && (
                      <div className={`header-nav-dropdown ${openKey === item.key ? 'open' : ''}`}>
                        {item.dropdown.map((d) => (
                          <button
                            key={d.key}
                            onClick={() => { d.onClick(); setOpenKey(null); }}
                            className={`header-nav-dropdown-link ${d.active ? 'active' : ''}`}
                          >
                            {d.label}
                            {d.active && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          <div className="header-right">
            {onSearchChange && (
              <div className="header-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  id="header-search-input"
                  placeholder="Tìm kiếm sách..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}

            {extraActions}

            <button className="icon-btn" onClick={handleToggleTheme} aria-label="Chuyển giao diện" title={mode === 'dark' ? 'Tối → Sáng' : mode === 'light' ? 'Sáng → Tự động' : `Tự động (${theme}) → Tối`}>
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>

            {navItems ? (
              user ? (
                <div className="header-user header-user-compact" ref={accountRef} style={{ position: 'relative' }}>
                  <button
                    className="header-avatar"
                    title={user?.full_name || user?.username}
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    aria-expanded={accountMenuOpen}
                  >
                    {user.avatar ? (
                      <img src={resolveImageUrl(user.avatar)} alt={initial} />
                    ) : (
                      initial
                    )}
                  </button>
                  {accountMenuOpen && (
                    <div className="header-account-dropdown">
                      <div className="header-account-dropdown-name">{user?.full_name || user?.username}</div>
                      {onGoToProfile && (
                        <button onClick={() => { onGoToProfile(); setAccountMenuOpen(false); }} className="header-account-dropdown-link">
                          Hồ sơ của tôi
                        </button>
                      )}
                      {onGoToFavorites && (
                        <button onClick={() => { onGoToFavorites(); setAccountMenuOpen(false); }} className="header-account-dropdown-link">
                          Sách yêu thích
                        </button>
                      )}
                      {onLogout && (
                        <button onClick={() => { setShowLogoutConfirm(true); setAccountMenuOpen(false); }} className="header-account-dropdown-link danger">
                          Đăng xuất
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={onLoginRequest} className="btn btn-primary">
                  Đăng Nhập
                </button>
              )
            ) : (
              <div className="header-user">
                <span className="header-user-name">
                  {user?.full_name || user?.username}
                  <span className="header-user-role"> ({user?.role === 'ADMIN' ? 'Quản Trị' : role === 'MANAGER' ? 'Quản Thủ' : 'Độc Giả'})</span>
                </span>
                {onLogout && (
                  <button onClick={() => setShowLogoutConfirm(true)} className="btn btn-secondary header-logout">
                    Thoát
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal xác nhận đăng xuất */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
        }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: 32,
            maxWidth: 400, width: '90%', textAlign: 'center',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>👋</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>Đăng xuất?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowLogoutConfirm(false)} className="btn btn-secondary" style={{ padding: '10px 24px' }}>
                Ở lại
              </button>
              <button onClick={() => { setShowLogoutConfirm(false); onLogout?.(); }} className="btn btn-danger" style={{ padding: '10px 24px' }}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo chế độ giao diện */}
      {themeToast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 24px', borderRadius: 12,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)', fontSize: '0.875rem', fontWeight: 600,
          zIndex: 9999, color: 'var(--text-primary)',
        }}>
          {themeToast}
        </div>
      )}
    </>
  );
}