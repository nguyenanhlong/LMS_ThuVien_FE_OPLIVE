'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
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
  navItems?: HeaderNavItem[];
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  extraActions?: ReactNode;
}) {
  const initial = user ? (user?.full_name || user?.username || '?').trim().charAt(0).toUpperCase() : '?';
  const [openKey, setOpenKey] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openKey) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openKey]);

  const handleNavClick = (item: HeaderNavItem) => {
    if (item.dropdown) {
      setOpenKey(openKey === item.key ? null : item.key);
    } else {
      item.onClick();
    }
  };

  return (
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

          <button className="icon-btn" aria-label="Chuyển giao diện sáng/tối" title="Sắp ra mắt">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          {navItems ? (
            user ? (
              <div className="header-user header-user-compact">
                <span className="header-avatar" title={user?.full_name || user?.username}>{initial}</span>
                {onLogout && (
                  <button onClick={onLogout} className="btn btn-secondary header-logout">
                    Thoát
                  </button>
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
                <span className="header-user-role"> ({role === 'MANAGER' ? 'Quản Thủ' : 'Độc Giả'})</span>
              </span>
              {onLogout && (
                <button onClick={onLogout} className="btn btn-secondary header-logout">
                  Thoát
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
