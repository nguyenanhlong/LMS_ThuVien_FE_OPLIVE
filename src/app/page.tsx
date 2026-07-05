'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BookCard from '@/components/books/BookCard';
import BookTable from '@/components/books/BookTable';
import BookModal from '@/components/books/BookModal';
import BorrowModal from '@/components/books/BorrowModal';
import LoanTable from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import ReturnModal from '@/components/loans/ReturnModal';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardChart from '@/components/dashboard/DashboardChart';
import RecentLoans from '@/components/dashboard/RecentLoans';
import Toast from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';

const categories = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính'];

type Section = 'dashboard' | 'books' | 'users' | 'loans';

const MANAGER_SECTIONS: Section[] = ['dashboard', 'books', 'users', 'loans'];
const USER_SECTIONS: Section[] = ['books', 'loans'];

function mapBook(b: any) {
  const available = (b.total_quantity || 0) - (b.borrowed_quantity || 0);
  return {
    id: String(b.id),
    title: b.title,
    author: b.author || '',
    category: b.publisher || 'Khác',
    description: b.description || '',
    total_quantity: b.total_quantity || 0,
    borrowed_quantity: b.borrowed_quantity || 0,
    status: available > 0 ? 'AVAILABLE' : 'BORROWED',
  };
}

function mapLoan(l: any) {
  const firstBook = l.books?.[0] || {};
  return {
    id: String(l.id),
    book: { id: String(firstBook.book_id || ''), title: firstBook.title || '', author: firstBook.author || '' },
    userName: l.borrower?.full_name || '',
    requestDate: l.loan_date ? new Date(l.loan_date).toLocaleDateString('vi-VN') : '',
    dueDate: l.due_date ? new Date(l.due_date).toLocaleDateString('vi-VN') : '',
    returnDate: l.return_date ? new Date(l.return_date).toLocaleDateString('vi-VN') : '',
    status: l.status === 'BORROWING' ? 'APPROVED' : l.status === 'RETURNED' ? 'RETURNED' : l.status === 'OVERDUE' ? 'OVERDUE' : l.status === 'PENDING' ? 'PENDING' : 'REJECTED',
  };
}

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
  const [borrowModal, setBorrowModal] = useState<{ id: string; title: string } | null>(null);
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
  const borrowedBooks = useMemo(() => filteredBooks.filter((b: any) => b.borrowed_quantity > 0), [filteredBooks]);

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

  const handleRequestReturn = async (loan: any) => {
    setReturnModal(loan);
  };

  const sectionTitle = useMemo(() => {
    if (!isManager) {
      const userTitles: Record<Section, string> = {
        books: 'Tra Cứu Sách', loans: 'Phiếu Mượn Của Tôi',
        dashboard: '',
        users: ''
      };
      return userTitles[section] || 'Tra Cứu Sách';
    }
    const titles: Record<Section, string> = { dashboard: 'Tổng Quan', books: 'Quản Lý Sách', users: 'Quản Lý Độc Giả', loans: 'Quản Lý Mượn Trả' };
    return titles[section];
  }, [section, isManager]);

  const renderAuth = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>THƯ VIỆN <span className="gradient-text">SỐ</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {authMode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
          </p>
        </div>

        {authError && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: authError.includes('thành công') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: authError.includes('thành công') ? 'var(--success)' : 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
            {authError}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input className="form-control" placeholder="Nhập username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input className="form-control" type="password" placeholder="Nhập mật khẩu" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={authSubmitting} style={{ marginTop: '8px' }}>
              {authSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Chưa có tài khoản?{' '}
              <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Đăng ký
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input className="form-control" placeholder="username" value={regData.username} onChange={(e) => setRegData({ ...regData, username: e.target.value })} autoFocus />
            </div>
            <div className="form-group">
              <label>Họ và tên</label>
              <input className="form-control" placeholder="Nguyễn Văn A" value={regData.full_name} onChange={(e) => setRegData({ ...regData, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" placeholder="email@example.com" value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input className="form-control" type="password" placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt" value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Vai trò</label>
              <select className="form-control" value={regData.role} onChange={(e) => setRegData({ ...regData, role: e.target.value })} style={{ background: 'var(--bg-tertiary)' }}>
                <option value="MEMBER">Độc giả</option>
                <option value="LIBRARIAN">Thủ thư</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={authSubmitting} style={{ marginTop: '8px' }}>
              {authSubmitting ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Đã có tài khoản?{' '}
              <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Đăng nhập
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (booksLoading && !books.length) {
      return <div className="empty-state"><p>Đang tải dữ liệu...</p></div>;
    }
    switch (section) {
      case 'dashboard':
        return (
          <>
            <DashboardCards
              totalBooks={books.length}
              availableBooks={books.filter((b: any) => b.status === 'AVAILABLE').length}
              borrowedBooks={activeLoans.length}
              totalMembers={users.length}
              pendingLoans={pendingLoans.length}
            />
            <div style={{ marginTop: '24px' }}>
              <DashboardChart
                availableBooks={books.filter((b: any) => b.status === 'AVAILABLE').length}
                borrowedBooks={activeLoans.length}
                totalMembers={users.length}
                pendingLoans={pendingLoans.length}
              />
            </div>
            <div style={{ marginTop: '24px' }}>
              <h2 className="section-title">Hoạt Động Gần Đây</h2>
              <RecentLoans loans={[...loans].reverse().slice(0, 5)} loading={loansLoading} />
            </div>
          </>
        );

      case 'books':
        return (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="form-control" style={{ maxWidth: '360px', background: 'var(--bg-secondary)' }} placeholder="Tìm kiếm sách..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((c) => (
                  <button key={c} onClick={() => setSelectedCategory(c)} className={`category-pill ${selectedCategory === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
            </div>

            {!isManager ? (
              booksLoading ? (
                <div className="loading-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="book-card-skeleton" />)}</div>
              ) : !filteredBooks.length ? (
                <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
              ) : (
                <div className="grid-3">{filteredBooks.map((book: any) => (
                  <BookCard key={book.id} book={book} onBorrow={(id, title) => setBorrowModal({ id, title })} />
                ))}</div>
              )
            ) : (
              <BookTable
                books={filteredBooks} loading={booksLoading}
                onEdit={(book) => setBookModal(book)}
                onDelete={handleDeleteBook}
                onAdd={() => setBookModal(true)}
              />
            )}
          </div>
        );

      case 'users':
        return (
          <div>
            <div className="manager-header-actions">
              <h2 className="section-title">Danh Sách Độc Giả</h2>
            </div>
            {usersLoading ? (
              <div className="empty-state"><p>Đang tải...</p></div>
            ) : !users.length ? (
              <div className="empty-state"><p>Chưa có độc giả nào</p></div>
            ) : (
              <div className="table-wrapper glass-panel">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Họ Tên</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Vai Trò</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id}>
                        <td><span style={{ fontWeight: 600 }}>{u.full_name}</span></td>
                        <td>{u.email}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.username}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'LIBRARIAN' ? 'badge-warning' : 'badge-success'}`}>
                            {u.role === 'ADMIN' ? 'Quản Trị' : u.role === 'LIBRARIAN' ? 'Thủ Thư' : 'Độc Giả'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {u.is_active ? 'Hoạt động' : 'Vô hiệu'}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => setUserModal(u)} className="btn btn-edit" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                            Sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {userModal && (
              <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setUserModal(null); }}>
                <div className="modal-content glass-panel">
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">Chỉnh Sửa Độc Giả</h3>
                      <p className="modal-subtitle">{userModal.full_name}</p>
                    </div>
                    <button onClick={() => setUserModal(null)} className="modal-close">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                    </button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleUpdateUser({ role: fd.get('role'), is_active: fd.get('is_active') === 'true' }); }}>
                    <div className="form-group">
                      <label>Vai trò</label>
                      <select name="role" className="form-control" defaultValue={userModal.role} style={{ background: 'var(--bg-tertiary)' }}>
                        <option value="MEMBER">Độc Giả</option>
                        <option value="LIBRARIAN">Thủ Thư</option>
                        <option value="ADMIN">Quản Trị</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select name="is_active" className="form-control" defaultValue={String(userModal.is_active)} style={{ background: 'var(--bg-tertiary)' }}>
                        <option value="true">Hoạt động</option>
                        <option value="false">Vô hiệu</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setUserModal(null)} className="btn btn-secondary">Hủy</button>
                      <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'loans':
        return (
          <div>
            {isManager && pendingLoans.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 className="section-title" style={{ color: 'var(--primary)' }}>Yêu Cầu Trả Sách Đang Chờ</h2>
                <LoanTable
                  loans={pendingLoans} loading={loansLoading}
                  role="MANAGER"
                  onReturn={(loan) => setReturnModal(loan)}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Danh Sách Mượn Trả</h2>
            </div>
            <LoanTable
              loans={isManager ? activeLoans.filter((l: any) => l.status !== 'PENDING') : activeLoans}
              loading={loansLoading}
              role={isManager ? 'MANAGER' : 'USER'}
              onApprove={handleApprove} onReject={handleReject}
              onReturn={isManager ? (loan) => setReturnModal(loan) : handleRequestReturn}
            />
            {completedLoans.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h2 className="section-title">Lịch Sử Mượn Trả</h2>
                <LoanHistory loans={completedLoans} loading={loansLoading} />
              </div>
            )}
          </div>
        );
    }
  };

  if (authLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return renderAuth();

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
          {renderContent()}
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
