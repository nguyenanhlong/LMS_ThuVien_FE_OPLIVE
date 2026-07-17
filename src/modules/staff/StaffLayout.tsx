'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRolePermissionsByRoleApi, getCachedPermissions } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Section = 'dashboard' | 'books' | 'users' | 'loans' | 'categories' | 'subcategories' | 'permissions';

const sectionTitles: Record<Section, string> = {
  dashboard: 'Tổng Quan', books: 'Quản Lý Sách', users: 'Quản Lý Độc Giả', loans: 'Quản Lý Mượn Trả', categories: 'Quản Lý Danh Mục', subcategories: 'Quản Lý Danh Mục Con', permissions: 'Phân Quyền',
};

export default function StaffLayout({ defaultSection, allowedSections, children }: any) {
  const { user, logout } = useAuth();
  const dbRole = user?.role === 'ADMIN' ? 'ADMIN' : user?.role === 'LIBRARIAN' ? 'MANAGER' : 'MANAGER';
  const sidebarRole = dbRole as 'USER' | 'MANAGER' | 'ADMIN';
  const [section, setSection] = useState<Section>(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  const fetchPermissions = useCallback(async () => {
    if (!user?.role) return;
    try {
      const data = await getRolePermissionsByRoleApi(user.role);
      setPermissions((Array.isArray(data) ? data : []).map((p: any) => p.permission));
    } catch {
      setPermissions(getCachedPermissions(user.role));
    }
  }, [user]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  useEffect(() => {
    const onFocus = () => fetchPermissions();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchPermissions]);

  useEffect(() => {
    const interval = setInterval(fetchPermissions, 60_000);
    return () => clearInterval(interval);
  }, [fetchPermissions]);

  const handleNavigate = (path: string) => {
    const map: Record<string, Section> = { '/dashboard': 'dashboard', '/books': 'books', '/users': 'users', '/loans': 'loans', '/categories': 'categories', '/subcategories': 'subcategories', '/permissions': 'permissions' };
    const s = map[path] || defaultSection;
    if (allowedSections.includes(s)) { setSection(s); setSidebarOpen(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header role="MANAGER" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={logout} />

      <div style={{ display: 'flex', flex: 1 }}>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <Sidebar activePath={`/${section}`} onNavigate={handleNavigate} role={sidebarRole} permissions={permissions} />
        </div>

        <main className="main-content container" style={{ paddingTop: '24px' }}>
          <Navbar title={sectionTitles[section]} role="MANAGER" />
          {typeof children === 'function' ? children(section, permissions) : children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
