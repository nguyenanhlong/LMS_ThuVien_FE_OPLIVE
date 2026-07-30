'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCachedPermissions, setCachedPermissions, getRolePermissionsByRoleApi } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NotificationBell from '@/components/notifications/NotificationBell';

type Section = 'dashboard' | 'books' | 'users' | 'loans' | 'categories' | 'permissions';

const sectionTitles: Record<Section, string> = {
  dashboard: 'Tổng Quan', books: 'Quản Lý Sách', users: 'Quản Lý Độc Giả', loans: 'Quản Lý Mượn Trả', categories: 'Quản Lý Danh Mục', permissions: 'Phân Quyền',
};

export default function StaffLayout({ defaultSection, allowedSections, children }: any) {
  const { user, logout } = useAuth();
  const dbRole = user?.role === 'ADMIN' ? 'ADMIN' : user?.role === 'LIBRARIAN' ? 'MANAGER' : 'MANAGER';
  const sidebarRole = dbRole as 'USER' | 'MANAGER' | 'ADMIN';
  const [section, setSection] = useState<Section>(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.role) return;
    const role = user.role;
    const cached = getCachedPermissions(role);
    if (cached.length > 0) {
      setPermissions(cached);
    } else {
      getRolePermissionsByRoleApi(role).then(data => {
        const perms = (Array.isArray(data) ? data : []).map((p: any) => p.permission);
        setCachedPermissions(role, perms);
        setPermissions(perms);
      }).catch(() => setPermissions([]));
    }
  }, [user]);

  const handleNavigate = (path: string) => {
    const map: Record<string, Section> = { '/dashboard': 'dashboard', '/books': 'books', '/users': 'users', '/loans': 'loans', '/categories': 'categories', '/permissions': 'permissions' };
    const s = map[path] || defaultSection;
    if (allowedSections.includes(s)) { setSection(s); setSidebarOpen(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header role="MANAGER" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={logout} extraActions={user ? <NotificationBell userRole={user.role} /> : undefined} />

      <div style={{ display: 'flex', flex: 1 }}>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <Sidebar activePath={`/${section}`} onNavigate={handleNavigate} role={sidebarRole} permissions={permissions} />
        </div>

        <main className="main-content container" style={{ paddingTop: '24px' }}>
          <Navbar title={sectionTitles[section]} role="MANAGER" />
          {typeof children === 'function' ? children(section, permissions, user?.role, (s: string) => { if (allowedSections.includes(s)) setSection(s as Section); }) : children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
