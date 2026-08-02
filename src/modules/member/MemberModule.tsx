'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import { FavoritesProvider, useFavorites } from '@/context/FavoritesContext';
import { getLoansApi, getCategoriesApi } from '@/lib/api';
import Header, { HeaderNavItem } from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NotificationBell from '@/components/notifications/NotificationBell';
import BooksSection from './BooksSection';
import LoansSection from './LoansSection';
import CartSection from './CartSection';
import ProfileSection from './ProfileSection';
import FavoritesSection from './FavoritesSection';
import AuthModal from '@/components/auth/AuthModal';

type Section = 'books' | 'cart' | 'loans' | 'profile' | 'favorites';
type NavKey = 'home' | 'search' | 'category' | 'favorites' | 'cart' | 'shelf';

const ACTIVE_LOAN_STATUSES = ['PENDING', 'PENDING_PAYMENT', 'BORROWING'];

export default function MemberModule() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <MemberModuleInner />
      </FavoritesProvider>
    </CartProvider>
  );
}

function MemberModuleInner() {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { favoriteIds } = useFavorites();
  const [section, setSection] = useState<Section>('books');
  const [loanRefreshKey, setLoanRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string; subCategories: { id: number; name: string }[] }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [activeLoanCount, setActiveLoanCount] = useState(0);
  const [activeNavKey, setActiveNavKey] = useState<NavKey>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user && window.location.search.includes('verified=true')) {
      setShowAuth(true);
      setVerifiedMessage('Xác thực email thành công! Vui lòng đăng nhập.');
      window.history.replaceState({}, '', '/');
    }
  }, [user]);

  const sections: Record<Section, string> = {
    books: 'Tra Cứu Sách',
    cart: 'Giỏ Hàng Của Tôi',
    loans: 'Phiếu Mượn Của Tôi',
    profile: 'Hồ Sơ Của Tôi',
    favorites: 'Sách Yêu Thích',
  };

  useEffect(() => {
    if (!user) { setActiveLoanCount(0); return; }
    getLoansApi()
      .then((data) => {
        const items = data.items || [];
        setActiveLoanCount(items.filter((l: any) => ACTIVE_LOAN_STATUSES.includes(l.status)).length);
      })
      .catch(() => {});
  }, [user, loanRefreshKey]);

  // Đăng xuất xong thì reset lại toàn bộ trạng thái đang xem (mục đang chọn, tìm kiếm,
  // bộ lọc thể loại...) để tài khoản đăng nhập sau không thấy lại ngữ cảnh của người trước.
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setSection('books');
      setSearchTerm('');
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setActiveNavKey('home');
      setShowAuth(false);
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    getCategoriesApi()
      .then((data) => setCategories((data || []).map((c: { id: string | number; name: string; sub_categories?: { id: string | number; name: string }[] }) => ({
        id: Number(c.id),
        name: c.name,
        subCategories: (c.sub_categories || []).map((s) => ({ id: Number(s.id), name: s.name })),
      }))))
      .catch(() => setCategories([]));
  }, []);

  const handleGoHome = () => {
    setSearchTerm('');
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSection('books');
    setActiveNavKey('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCart = () => {
    setSection('cart');
    setActiveNavKey('cart');
  };

  const handleGoToLoans = () => {
    if (!user) { setShowAuth(true); return; }
    setSection('loans');
    setActiveNavKey('shelf');
  };

  const handleRequireAuth = useCallback(() => {
    setShowAuth(true);
  }, []);

  const handleGoToProfile = () => {
    if (!user) { setShowAuth(true); return; }
    setSection('profile');
  };

  const handleGoToFavorites = () => {
    if (!user) { setShowAuth(true); return; }
    setSection('favorites');
    setActiveNavKey('favorites');
  };

  const handleSelectCategory = (categoryId: number | null, subCategoryId: number | null = null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(subCategoryId);
    setSection('books');
    setActiveNavKey('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubCategory = (subCategoryId: number | null) => {
    setSelectedSubCategoryId(subCategoryId);
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name;
  const selectedSubCategoryName = categories
    .find((c) => c.id === selectedCategoryId)
    ?.subCategories.find((s) => s.id === selectedSubCategoryId)?.name;
  const currentSubCategories = categories.find((c) => c.id === selectedCategoryId)?.subCategories || [];

  const navItems: HeaderNavItem[] = [
    { key: 'home', label: 'Trang chủ', active: activeNavKey === 'home', onClick: handleGoHome },
    {
      key: 'category',
      label: selectedCategoryId === null ? 'Thể loại' : `Thể loại: ${selectedSubCategoryName || selectedCategoryName}`,
      active: activeNavKey === 'category',
      onClick: () => {},
      megaMenu: [
        { key: 'all', label: 'Tất cả', active: activeNavKey === 'category' && selectedCategoryId === null, onClick: () => handleSelectCategory(null) },
        ...categories.map((c) => ({
          key: String(c.id),
          label: c.name,
          active: activeNavKey === 'category' && selectedCategoryId === c.id && selectedSubCategoryId === null,
          onClick: () => handleSelectCategory(c.id),
          children: c.subCategories.map((s) => ({
            key: `${c.id}-${s.id}`,
            label: s.name,
            active: activeNavKey === 'category' && selectedCategoryId === c.id && selectedSubCategoryId === s.id,
            onClick: () => handleSelectCategory(c.id, s.id),
          })),
        })),
      ],
    },
    { key: 'favorites', label: 'Yêu thích', active: activeNavKey === 'favorites', badge: favoriteIds.size, onClick: handleGoToFavorites },
    { key: 'cart', label: 'Giỏ hàng', active: activeNavKey === 'cart', badge: cartItems.length, onClick: handleGoToCart },
    { key: 'shelf', label: 'Kệ sách', active: activeNavKey === 'shelf', badge: activeLoanCount, onClick: handleGoToLoans },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header
        role="USER"
        user={user}
        onLogout={user ? logout : undefined}
        onLoginRequest={() => setShowAuth(true)}
        onGoToProfile={handleGoToProfile}
        onGoToFavorites={handleGoToFavorites}
        navItems={navItems}
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); setSection('books'); setActiveNavKey('search'); }}
        extraActions={user ? <NotificationBell userRole={user.role} /> : undefined}
      />

      <main className="main-content container" style={{ paddingTop: '24px' }}>
        <Navbar title={sections[section]} role="USER" />
        {section === 'books' && (
          <BooksSection
            searchTerm={searchTerm}
            selectedCategoryId={selectedCategoryId}
            subCategories={currentSubCategories}
            selectedSubCategoryId={selectedSubCategoryId}
            onSelectSubCategory={handleSelectSubCategory}
            showRecommended={activeNavKey === 'home'}
            onRequireAuth={handleRequireAuth}
          />
        )}
        {section === 'cart' && (
          <CartSection
            onLoanCreated={() => setLoanRefreshKey((k) => k + 1)}
            onGoToLoans={handleGoToLoans}
            onRequireAuth={handleRequireAuth}
          />
        )}
        {section === 'loans' && <LoansSection key={loanRefreshKey} user={user} />}
        {section === 'profile' && <ProfileSection />}
        {section === 'favorites' && <FavoritesSection onRequireAuth={handleRequireAuth} />}
      </main>

      <Footer />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          initialMessage={verifiedMessage}
        />
      )}
    </div>
  );
}
