'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  const sidebarRole = user?.role === 'ADMIN' ? 'ADMIN' : 'MANAGER';
  const [section, setSection] = useState<Section>(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <Sidebar activePath={`/${section}`} onNavigate={handleNavigate} role={sidebarRole} />
        </div>

        <main className="main-content container" style={{ paddingTop: '24px' }}>
          <Navbar title={sectionTitles[section]} role="MANAGER" />
          {typeof children === 'function' ? children(section) : children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
