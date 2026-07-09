'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BooksSection from './BooksSection';
import LoansSection from './LoansSection';

type Section = 'books' | 'loans';

export default function MemberModule() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('books');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loanRefreshKey, setLoanRefreshKey] = useState(0);

  const sections: Record<Section, string> = { books: 'Tra Cứu Sách', loans: 'Phiếu Mượn Của Tôi' };

  const handleNavigate = (path: string) => {
    const map: Record<string, Section> = { '/books': 'books', '/loans': 'loans' };
    if (map[path]) { setSection(map[path]); setSidebarOpen(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header role="USER" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={logout} />

      <div style={{ display: 'flex', flex: 1 }}>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <Sidebar activePath={`/${section}`} onNavigate={handleNavigate} role="USER" />
        </div>

        <main className="main-content container" style={{ paddingTop: '24px' }}>
          <Navbar title={sections[section]} role="USER" />
          {section === 'books' && <BooksSection user={user} onLoanCreated={() => setLoanRefreshKey((k) => k + 1)} />}
          {section === 'loans' && <LoansSection key={loanRefreshKey} user={user} />}
        </main>
      </div>

      <Footer />
    </div>
  );
}
