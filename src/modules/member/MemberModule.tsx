'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import { getLoansApi } from '@/lib/api';
import Header, { HeaderNavItem } from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NotificationBell from '@/components/notifications/NotificationBell';
import BooksSection from './BooksSection';
import LoansSection from './LoansSection';
import CartSection from './CartSection';

type Section = 'books' | 'cart' | 'loans';
type NavKey = 'home' | 'search' | 'category' | 'recommend' | 'cart' | 'shelf';

const ACTIVE_LOAN_STATUSES = ['PENDING', 'PENDING_PAYMENT', 'BORROWING'];
const CATEGORIES = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính'];

export default function MemberModule() {
  return (
    <CartProvider>
      <MemberModuleInner />
    </CartProvider>
  );
}

function MemberModuleInner() {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const [section, setSection] = useState<Section>('books');
  const [loanRefreshKey, setLoanRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
  const [activeLoanCount, setActiveLoanCount] = useState(0);
  const [activeNavKey, setActiveNavKey] = useState<NavKey>('home');

  const sections: Record<Section, string> = { books: 'Tra Cứu Sách', cart: 'Giỏ Hàng Của Tôi', loans: 'Phiếu Mượn Của Tôi' };

  useEffect(() => {
    if (!user) return;
    getLoansApi()
      .then((data) => {
        const items = data.items || [];
        setActiveLoanCount(items.filter((l: any) => ACTIVE_LOAN_STATUSES.includes(l.status)).length);
      })
      .catch(() => {});
  }, [user, loanRefreshKey]);

  useEffect(() => {
    if (!pendingAnchor || section !== 'books') return;
    document.getElementById(pendingAnchor)?.scrollIntoView({ behavior: 'smooth' });
    setPendingAnchor(null);
  }, [pendingAnchor, section]);

  const handleGoHome = () => {
    setSearchTerm('');
    setSelectedCategory('Tất cả');
    setSection('books');
    setActiveNavKey('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToRecommend = () => {
    setSection('books');
    setActiveNavKey('recommend');
    setPendingAnchor('recommended-books');
  };

  const handleGoToCart = () => {
    setSection('cart');
    setActiveNavKey('cart');
  };

  const handleGoToLoans = () => {
    setSection('loans');
    setActiveNavKey('shelf');
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSection('books');
    setActiveNavKey('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: HeaderNavItem[] = [
    { key: 'home', label: 'Trang chủ', active: activeNavKey === 'home', onClick: handleGoHome },
    {
      key: 'category',
      label: selectedCategory === 'Tất cả' ? 'Thể loại' : `Thể loại: ${selectedCategory}`,
      active: activeNavKey === 'category',
      onClick: () => {},
      dropdown: CATEGORIES.map((c) => ({
        key: c,
        label: c,
        active: activeNavKey === 'category' && selectedCategory === c,
        onClick: () => handleSelectCategory(c),
      })),
    },
    { key: 'recommend', label: 'Gợi ý', active: activeNavKey === 'recommend', onClick: handleGoToRecommend },
    { key: 'cart', label: 'Giỏ hàng', active: activeNavKey === 'cart', badge: cartItems.length, onClick: handleGoToCart },
    { key: 'shelf', label: 'Kệ sách', active: activeNavKey === 'shelf', badge: activeLoanCount, onClick: handleGoToLoans },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header
        role="USER"
        user={user}
        onLogout={logout}
        navItems={navItems}
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); setSection('books'); setActiveNavKey('search'); }}
        extraActions={user && <NotificationBell />}
      />

      <main className="main-content container" style={{ paddingTop: '24px' }}>
        <Navbar title={sections[section]} role="USER" />
        {section === 'books' && (
          <BooksSection
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        )}
        {section === 'cart' && (
          <CartSection
            onLoanCreated={() => setLoanRefreshKey((k) => k + 1)}
            onGoToLoans={handleGoToLoans}
          />
        )}
        {section === 'loans' && <LoansSection key={loanRefreshKey} user={user} />}
      </main>

      <Footer />
    </div>
  );
}
