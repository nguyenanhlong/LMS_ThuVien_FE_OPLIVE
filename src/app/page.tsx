'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { mapBook, mapLoan } from '@/utils/mappers';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

import LoginPage from '@/components/auth/LoginPage';
import DashboardPage from '@/components/dashboard/DashboardPage';
import BooksPage from '@/components/books/BooksPage';
import UsersPage from '@/components/users/UsersPage';
import UserEditModal from '@/components/users/UserEditModal';
import LoansPage from '@/components/loans/LoansPage';

import BookModal from '@/components/books/BookModal';
import BorrowModal from '@/components/books/BorrowModal';
import ReturnModal from '@/components/loans/ReturnModal';

type Section = 'dashboard' | 'books' | 'users' | 'loans';
const MANAGER_SECTIONS: Section[] = ['dashboard', 'books', 'users', 'loans'];
const USER_SECTIONS: Section[] = ['books', 'loans'];

export default function Home() {
  const { user, loading: authLoading, login, register, logout, isManager } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regData, setRegData] = useState({ username: '', full_name: '', email: '', password: '', role: 'MEMBER' });
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [section, setSection] = useState<Section>('books');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [books, setBooks] = useState<any[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal] = useState<any>(null);

  const [bookModal, setBookModal] = useState<boolean | any>(false);
  const [borrowModal, setBorrowModal] = useState<any>(null);
  const [returnModal, setReturnModal] = useState<any>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const data = await api<any>(`/books?keyword=${encodeURIComponent(searchTerm)}&pageSize=100`);
      setBooks((data.items || []).map(mapBook));
    } catch { setBooks([]); }
    setBooksLoading(false);
  }, [searchTerm]);

  const fetchLoans = useCallback(async () => {
    setLoansLoading(true);
    try {
      const userIdParam = !isManager && user ? `&user_id=${user.id}` : '';
      const data = await api<any>(`/loans?pageSize=100${userIdParam}`);
      setLoans((data.items || []).map(mapLoan));
    } catch { setLoans([]); }
    setLoansLoading(false);
  }, [isManager, user]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await api<any[]>('/users');
      setUsers(data || []);
    } catch { setUsers([]); }
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchBooks();
    fetchLoans();
    if (isManager) fetchUsers();
  }, [user, fetchBooks, fetchLoans, fetchUsers, isManager]);

  useEffect(() => { if (user) fetchBooks(); }, [searchTerm, user, fetchBooks]);

  useEffect(() => {
    document.title = isManager ? 'Thư Viện Số - Quản Lý' : 'Thư Viện Số - Tra Cứu';
  }, [isManager]);

  useEffect(() => {
    if (!user) { setSection('books'); return; }
    setSection(user.role === 'ADMIN' || user.role === 'LIBRARIAN' ? 'dashboard' : 'books');
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginUser || !loginPass) { setAuthError('Vui lòng nhập đầy đủ thông tin'); return; }
    setAuthSubmitting(true);
    try {
      await login(loginUser, loginPass);
      setLoginUser(''); setLoginPass('');
    } catch (err: any) { setAuthError(err.message || 'Đăng nhập thất bại'); }
    setAuthSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { username, full_name, email, password } = regData;
    if (!username || !full_name || !email || !password) { setAuthError('Vui lòng nhập đầy đủ thông tin'); return; }
    setAuthSubmitting(true);
    try {
      await register(regData);
      setAuthMode('login');
      setLoginUser(username);
      setAuthError('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err: any) { setAuthError(err.message || 'Đăng ký thất bại'); }
    setAuthSubmitting(false);
  };

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'Tất cả') return books;
    return books.filter((b: any) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const activeLoans = useMemo(() => loans.filter((l: any) => l.status !== 'RETURNED'), [loans]);
  const completedLoans = useMemo(() => loans.filter((l: any) => l.status === 'RETURNED'), [loans]);
  const pendingLoans = useMemo(() => loans.filter((l: any) => l.status === 'PENDING'), [loans]);

  const handleNavigate = (path: string) => {
    const sectionMap: Record<string, Section> = { '/dashboard': 'dashboard', '/books': 'books', '/users': 'users', '/loans': 'loans' };
    const s = sectionMap[path] || 'books';
    const allowed = isManager ? MANAGER_SECTIONS : USER_SECTIONS;
    if (allowed.includes(s)) setSection(s);
    setSidebarOpen(false);
  };

  const handleAddBook = async (data: any) => {
    try {
      await api('/books', {
        method: 'POST',
        body: JSON.stringify({ title: data.title, author: data.author, description: data.description, publisher: data.category, total_quantity: 1 }),
      });
      showToast('Thêm đầu sách mới thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch { showToast('Lỗi khi thêm sách', 'error'); }
  };

  const handleUpdateBook = async (data: any) => {
    try {
      await api(`/books/${bookModal?.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: data.title, author: data.author, description: data.description, publisher: data.category }),
      });
      showToast('Cập nhật thông tin sách thành công!', 'success');
      setBookModal(false); fetchBooks();
    } catch { showToast('Lỗi khi cập nhật sách', 'error'); }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await api(`/books/${id}`, { method: 'DELETE' });
      showToast('Xóa sách thành công!', 'success');
      fetchBooks(); fetchLoans();
    } catch { showToast('Lỗi khi xóa sách', 'error'); }
  };

  const handleBorrow = async (readerName: string, readerId: string) => {
    if (!borrowModal) return;
    try {
      await api('/loans', {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(readerId),
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          items: [{ book_id: parseInt(borrowModal.id), quantity: 1 }],
        }),
      });
      showToast('Tạo phiếu mượn thành công!', 'success');
      setBorrowModal(null); fetchBooks(); fetchLoans();
    } catch (err: any) { showToast(err.message || 'Lỗi khi tạo phiếu mượn', 'error'); }
  };

  const handleApprove = async (requestId: string) => {
    showToast('Phiếu mượn đã được tạo tự động', 'success');
  };

  const handleReject = async (requestId: string) => {
    try {
      await api(`/loans/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      showToast('Đã hủy phiếu mượn!', 'success');
      fetchLoans();
    } catch { showToast('Lỗi khi hủy', 'error'); }
  };

  const handleReturn = async (requestId: string) => {
    try {
      await api(`/loans/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RETURNED' }),
      });
      showToast('Xác nhận trả sách thành công!', 'success');
      setReturnModal(null); fetchBooks(); fetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi trả sách', 'error'); }
  };

  const handleUpdateUser = async (data: any) => {
    try {
      await api(`/users/${userModal.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      showToast('Cập nhật thông tin độc giả thành công!', 'success');
      setUserModal(null); fetchUsers();
    } catch { showToast('Lỗi khi cập nhật', 'error'); }
  };

  const sectionTitle = useMemo(() => {
    if (!isManager) {
      const userTitles: Record<Section, string> = {
        books: 'Tra Cứu Sách', loans: 'Phiếu Mượn Của Tôi',
        dashboard: '', users: ''
      };
      return userTitles[section] || 'Tra Cứu Sách';
    }
    const titles: Record<Section, string> = { dashboard: 'Tổng Quan', books: 'Quản Lý Sách', users: 'Quản Lý Độc Giả', loans: 'Quản Lý Mượn Trả' };
    return titles[section];
  }, [section, isManager]);

  if (authLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return (
    <LoginPage
      authMode={authMode} setAuthMode={setAuthMode}
      authError={authError} setAuthError={setAuthError}
      loginUser={loginUser} setLoginUser={setLoginUser}
      loginPass={loginPass} setLoginPass={setLoginPass}
      regData={regData} setRegData={setRegData}
      authSubmitting={authSubmitting}
      handleLogin={handleLogin} handleRegister={handleRegister}
    />
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header role={isManager ? 'MANAGER' : 'USER'} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={logout} />

      <div style={{ display: 'flex', flex: 1 }}>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <Sidebar activePath={`/${section}`} onNavigate={handleNavigate} role={isManager ? 'MANAGER' : 'USER'} />
        </div>

        <main className="main-content container" style={{ paddingTop: '24px' }}>
          <Navbar title={sectionTitle} role={isManager ? 'MANAGER' : 'USER'} />

          {section === 'dashboard' && (
            <DashboardPage
              books={books} activeLoans={activeLoans}
              users={users} pendingLoans={pendingLoans}
              loans={loans} loansLoading={loansLoading}
            />
          )}

          {section === 'books' && (
            <BooksPage
              isManager={isManager} booksLoading={booksLoading}
              filteredBooks={filteredBooks}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
              onAdd={() => setBookModal(true)}
              onEdit={(book: any) => setBookModal(book)}
              onDelete={handleDeleteBook}
              onBorrow={setBorrowModal}
            />
          )}

          {section === 'users' && (
            <>
              <UsersPage
                users={users} usersLoading={usersLoading}
                onEditUser={setUserModal}
                onUpdateUser={handleUpdateUser}
              />
              {userModal && (
                <UserEditModal
                  user={userModal}
                  onClose={() => setUserModal(null)}
                  onUpdate={handleUpdateUser}
                />
              )}
            </>
          )}

          {section === 'loans' && (
            <LoansPage
              isManager={isManager}
              pendingLoans={pendingLoans}
              activeLoans={activeLoans}
              completedLoans={completedLoans}
              loansLoading={loansLoading}
              onApprove={handleApprove}
              onReject={handleReject}
              onReturn={(loan: any) => setReturnModal(loan)}
            />
          )}

        </main>
      </div>

      <Footer />

      {isManager && (
        <BookModal open={!!bookModal} book={typeof bookModal === 'object' ? bookModal : null} onClose={() => setBookModal(false)} onSubmit={typeof bookModal === 'object' ? handleUpdateBook : handleAddBook} />
      )}
      <BorrowModal book={borrowModal} onClose={() => setBorrowModal(null)} onSubmit={handleBorrow} user={user} />
      <ReturnModal open={!!returnModal} loan={returnModal} onConfirm={(id: string) => handleReturn(id)} onCancel={() => setReturnModal(null)} loading={false} isAdmin={isManager} confirmText={isManager ? 'Xác Nhận Thu Hồi' : 'Xác Nhận Trả Sách'} />
      <Toast message={toastMessage?.text || ''} type={toastMessage?.type || 'success'} />

      <style>{`
        .sidebar { width: 240px; flex-shrink: 0; border-right: 1px solid var(--border); background: var(--bg-secondary); padding: 12px 0; overflow-y: auto; }
        .sidebar-backdrop { display: none; }
        .sidebar-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 16px; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; transition: all 0.15s ease; border: none; background: none; text-align: left; cursor: pointer; }
        .sidebar-link:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
        .sidebar-link.active { background: rgba(99,102,241,0.1); color: var(--primary); border-right: 2px solid var(--primary); }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .btn-full { width: 100%; justify-content: center; }
        @media (max-width: 768px) {
          .sidebar { position: fixed; top: 0; left: -260px; height: 100vh; z-index: 999; transition: left 0.3s ease; box-shadow: none; }
          .sidebar.open { left: 0; box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
          .sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(9,13,22,0.6); z-index: 998; }
        }
      `}</style>
    </div>
  );
}
