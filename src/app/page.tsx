'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BookCard from '@/components/books/BookCard';
import BookTable from '@/components/books/BookTable';
import BookModal from '@/components/books/BookModal';
import BorrowModal from '@/components/books/BorrowModal';
import MemberCard from '@/components/members/MemberCard';
import MemberTable from '@/components/members/MemberTable';
import MemberModal from '@/components/members/MemberModal';
import ProviderTable from '@/components/providers/ProviderTable';
import ProviderModal from '@/components/providers/ProviderModal';
import LoanTable from '@/components/loans/LoanTable';
import LoanHistory from '@/components/loans/LoanHistory';
import ReturnModal from '@/components/loans/ReturnModal';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardChart from '@/components/dashboard/DashboardChart';
import RecentLoans from '@/components/dashboard/RecentLoans';
import Toast from '@/components/ui/Toast';

const GET_BOOKS = gql`
  query GetBooks($search: String, $category: String) {
    books(search: $search, category: $category) { id title author category description status }
  }
`;
const GET_MEMBERS = gql`
  query GetMembers { members { id name email phone joinDate status } }
`;
const GET_PROVIDERS = gql`
  query GetProviders { providers { id name contact email phone address } }
`;
const GET_LOANS = gql`
  query GetBorrowRequests { borrowRequests { id book { id title author } userId userName status requestDate dueDate } }
`;
const ADD_BOOK = gql`
  mutation AddBook($title: String!, $author: String!, $category: String!, $description: String) {
    addBook(title: $title, author: $author, category: $category, description: $description) { id title author category description status }
  }
`;
const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $title: String, $author: String, $category: String, $description: String) {
    updateBook(id: $id, title: $title, author: $author, category: $category, description: $description) { id title author category description status }
  }
`;
const DELETE_BOOK = gql`mutation DeleteBook($id: ID!) { deleteBook(id: $id) }`;
const ADD_MEMBER = gql`
  mutation AddMember($name: String!, $email: String!, $phone: String!) {
    addMember(name: $name, email: $email, phone: $phone) { id name email phone joinDate status }
  }
`;
const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: ID!, $name: String, $email: String, $phone: String, $status: String) {
    updateMember(id: $id, name: $name, email: $email, phone: $phone, status: $status) { id name email phone joinDate status }
  }
`;
const DELETE_MEMBER = gql`mutation DeleteMember($id: ID!) { deleteMember(id: $id) }`;
const ADD_PROVIDER = gql`
  mutation AddProvider($name: String!, $contact: String!, $email: String!, $phone: String!, $address: String!) {
    addProvider(name: $name, contact: $contact, email: $email, phone: $phone, address: $address) { id name contact email phone address }
  }
`;
const UPDATE_PROVIDER = gql`
  mutation UpdateProvider($id: ID!, $name: String, $contact: String, $email: String, $phone: String, $address: String) {
    updateProvider(id: $id, name: $name, contact: $contact, email: $email, phone: $phone, address: $address) { id name contact email phone address }
  }
`;
const DELETE_PROVIDER = gql`mutation DeleteProvider($id: ID!) { deleteProvider(id: $id) }`;
const BORROW_BOOK = gql`
  mutation BorrowBook($bookId: ID!, $userId: ID!, $userName: String!) {
    borrowBook(bookId: $bookId, userId: $userId, userName: $userName) { id status userName }
  }
`;
const UPDATE_REQUEST = gql`
  mutation UpdateRequestStatus($requestId: ID!, $status: String!) {
    updateRequestStatus(requestId: $requestId, status: $status) { id status }
  }
`;
const RETURN_BOOK = gql`mutation ReturnBook($requestId: ID!) { returnBook(requestId: $requestId) { id status } }`;
const REQUEST_RETURN = gql`mutation RequestReturn($requestId: ID!) { requestReturn(requestId: $requestId) { id status } }`;

const categories = ['Tất cả', 'Kỹ năng sống', 'Tiểu thuyết', 'Khoa học', 'Tài chính'];

type Section = 'dashboard' | 'books' | 'members' | 'loans' | 'providers';

const MANAGER_SECTIONS: Section[] = ['dashboard', 'books', 'members', 'loans', 'providers'];
const USER_SECTIONS: Section[] = ['books', 'loans'];

export default function Home() {
  const [role, setRole] = useState<'USER' | 'MANAGER'>('USER');
  const [section, setSection] = useState<Section>('books');

  useEffect(() => {
    const saved = localStorage.getItem('thuvien_role');
    if (saved === 'USER' || saved === 'MANAGER') setRole(saved);
    const savedSection = localStorage.getItem('thuvien_section');
    if (savedSection) setSection(savedSection as Section);
  }, []);

  useEffect(() => {
    localStorage.setItem('thuvien_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('thuvien_section', section);
  }, [section]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [bookModal, setBookModal] = useState<boolean | any>(false);
  const [borrowModal, setBorrowModal] = useState<{ id: string; title: string } | null>(null);
  const [memberModal, setMemberModal] = useState<boolean | any>(false);
  const [providerModal, setProviderModal] = useState<boolean | any>(false);
  const [returnModal, setReturnModal] = useState<any>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => {
    const allowed = role === 'USER' ? USER_SECTIONS : MANAGER_SECTIONS;
    if (!allowed.includes(section)) setSection('books');
  }, [role, section]);

  const { data: booksData, loading: booksLoading, error: booksError, refetch: refetchBooks } = useQuery<any>(GET_BOOKS, {
    variables: { search: searchTerm, category: selectedCategory },
  });

  const { data: membersData, loading: membersLoading, refetch: refetchMembers } = useQuery<any>(GET_MEMBERS);
  const { data: providersData, loading: providersLoading, refetch: refetchProviders } = useQuery<any>(GET_PROVIDERS);
  const { data: loansData, loading: loansLoading, refetch: refetchLoans } = useQuery<any>(GET_LOANS);

  const [addBook] = useMutation(ADD_BOOK);
  const [updateBook] = useMutation(UPDATE_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);
  const [addMember] = useMutation(ADD_MEMBER);
  const [updateMember] = useMutation(UPDATE_MEMBER);
  const [deleteMember] = useMutation(DELETE_MEMBER);
  const [addProvider] = useMutation(ADD_PROVIDER);
  const [updateProvider] = useMutation(UPDATE_PROVIDER);
  const [deleteProvider] = useMutation(DELETE_PROVIDER);
  const [borrowBook] = useMutation(BORROW_BOOK);
  const [updateRequest] = useMutation(UPDATE_REQUEST);
  const [returnBook] = useMutation(RETURN_BOOK);
  const [requestReturn] = useMutation(REQUEST_RETURN);

  const books = booksData?.books || [];
  const members = membersData?.members || [];
  const providers = providersData?.providers || [];
  const loans = loansData?.borrowRequests || [];
  const activeLoans = useMemo(() => loans.filter((l: any) => l.status !== 'RETURNED'), [loans]);
  const completedLoans = useMemo(() => loans.filter((l: any) => l.status === 'RETURNED'), [loans]);
  const pendingLoans = useMemo(() => loans.filter((l: any) => l.status === 'PENDING' || l.status === 'PENDING_RETURN'), [loans]);
  const borrowedBooks = useMemo(() => books.filter((b: any) => b.status === 'BORROWED'), [books]);

  const handleNavigate = (path: string) => {
    const sectionMap: Record<string, Section> = {
      '/dashboard': 'dashboard', '/books': 'books', '/members': 'members',
      '/loans': 'loans', '/providers': 'providers',
    };
    const s = sectionMap[path] || 'books';
    const allowed = role === 'USER' ? USER_SECTIONS : MANAGER_SECTIONS;
    if (allowed.includes(s)) setSection(s);
    setSidebarOpen(false);
  };

  const handleRoleChange = (newRole: 'USER' | 'MANAGER') => {
    setRole(newRole);
    localStorage.setItem('thuvien_role', newRole);
    const allowed = newRole === 'USER' ? USER_SECTIONS : MANAGER_SECTIONS;
    if (!allowed.includes(section)) setSection(newRole === 'USER' ? 'books' : 'dashboard');
  };

  const handleAddBook = async (data: any) => {
    try {
      await addBook({ variables: data });
      showToast('Thêm đầu sách mới thành công!', 'success');
      setBookModal(false); refetchBooks();
    } catch { showToast('Lỗi khi thêm sách', 'error'); }
  };

  const handleUpdateBook = async (data: any) => {
    try {
      await updateBook({ variables: { id: bookModal?.id, ...data } });
      showToast('Cập nhật thông tin sách thành công!', 'success');
      setBookModal(false); refetchBooks();
    } catch { showToast('Lỗi khi cập nhật sách', 'error'); }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      const { data } = (await deleteBook({ variables: { id } })) as any;
      if (data?.deleteBook) { showToast('Xóa sách thành công!', 'success'); refetchBooks(); refetchLoans(); }
      else showToast('Không thể xóa sách', 'error');
    } catch { showToast('Lỗi khi xóa sách', 'error'); }
  };

  const handleAddMember = async (data: any) => {
    try {
      await addMember({ variables: data });
      showToast('Thêm độc giả mới thành công!', 'success');
      setMemberModal(false); refetchMembers();
    } catch { showToast('Lỗi khi thêm độc giả', 'error'); }
  };

  const handleUpdateMember = async (data: any) => {
    try {
      await updateMember({ variables: { id: memberModal?.id, ...data } });
      showToast('Cập nhật thông tin độc giả thành công!', 'success');
      setMemberModal(false); refetchMembers();
    } catch { showToast('Lỗi khi cập nhật độc giả', 'error'); }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa độc giả này?')) return;
    try {
      const { data } = (await deleteMember({ variables: { id } })) as any;
      if (data?.deleteMember) { showToast('Xóa độc giả thành công!', 'success'); refetchMembers(); }
      else showToast('Không thể xóa độc giả', 'error');
    } catch { showToast('Lỗi khi xóa độc giả', 'error'); }
  };

  const handleAddProvider = async (data: any) => {
    try {
      await addProvider({ variables: data });
      showToast('Thêm nhà cung cấp mới thành công!', 'success');
      setProviderModal(false); refetchProviders();
    } catch { showToast('Lỗi khi thêm nhà cung cấp', 'error'); }
  };

  const handleUpdateProvider = async (data: any) => {
    try {
      await updateProvider({ variables: { id: providerModal?.id, ...data } });
      showToast('Cập nhật thông tin nhà cung cấp thành công!', 'success');
      setProviderModal(false); refetchProviders();
    } catch { showToast('Lỗi khi cập nhật nhà cung cấp', 'error'); }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
    try {
      const { data } = (await deleteProvider({ variables: { id } })) as any;
      if (data?.deleteProvider) { showToast('Xóa nhà cung cấp thành công!', 'success'); refetchProviders(); }
      else showToast('Không thể xóa nhà cung cấp', 'error');
    } catch { showToast('Lỗi khi xóa nhà cung cấp', 'error'); }
  };

  const handleBorrow = async (readerName: string, readerId: string) => {
    if (!borrowModal) return;
    const member = members.find(
      (m: any) => m.id === readerId && m.name.toLowerCase() === readerName.toLowerCase()
    );
    if (!member) {
      showToast('Bạn đã nhập sai tên/mã độc giả hoặc không có tài khoản trên hệ thống', 'error');
      return;
    }
    try {
      await borrowBook({ variables: { bookId: borrowModal.id, userId: readerId, userName: readerName } });
      showToast('Gửi yêu cầu mượn sách thành công!', 'success');
      setBorrowModal(null);
      refetchBooks(); refetchLoans();
    } catch (err: any) { showToast(err.message || 'Lỗi khi yêu cầu mượn sách', 'error'); }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await updateRequest({ variables: { requestId, status: 'APPROVED' } });
      showToast('Đã phê duyệt yêu cầu mượn sách!', 'success');
      refetchBooks(); refetchLoans();
    } catch { showToast('Lỗi khi phê duyệt', 'error'); }
  };

  const handleReject = async (requestId: string) => {
    try {
      await updateRequest({ variables: { requestId, status: 'REJECTED' } });
      showToast('Đã từ chối yêu cầu mượn sách!', 'success');
      refetchLoans();
    } catch { showToast('Lỗi khi từ chối', 'error'); }
  };

  const handleReturn = async (requestId: string) => {
    try {
      await returnBook({ variables: { requestId } });
      showToast('Xác nhận trả sách thành công!', 'success');
      setReturnModal(null); refetchBooks(); refetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi trả sách', 'error'); }
  };

  const handleRequestReturn = async (loan: any) => {
    try {
      await requestReturn({ variables: { requestId: loan.id } });
      showToast('Yêu cầu trả sách đã được gửi, vui lòng chờ xác nhận!', 'success');
      refetchLoans();
    } catch (e: any) { showToast(e.message || 'Lỗi khi yêu cầu trả sách', 'error'); }
  };

  const sectionTitle = useMemo(() => {
    if (role === 'USER') {
      const userTitles: Partial<Record<Section, string>> = { books: 'Danh Sách Sách', loans: 'Yêu Cầu Của Tôi' };
      return userTitles[section] || '';
    }
    const mgrTitles: Record<Section, string> = {
      dashboard: 'Tổng Quan', books: 'Quản Lý Sách', members: 'Quản Lý Độc Giả',
      loans: 'Quản Lý Mượn Trả', providers: 'Nhà Cung Cấp',
    };
    return mgrTitles[section];
  }, [section, role]);

  const handleBorrowFromForm = async (data: any) => {
    try {
      await borrowBook({ variables: { bookId: data.bookId, userId: data.memberId, userName: data.memberName } });
      showToast('Gửi yêu cầu mượn sách thành công!', 'success');
      refetchBooks(); refetchLoans();
    } catch (err: any) { showToast(err.message || 'Lỗi', 'error'); }
  };

  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return (
          <>
            <DashboardCards
              totalBooks={books.length}
              availableBooks={books.filter((b: any) => b.status === 'AVAILABLE').length}
              borrowedBooks={borrowedBooks.length}
              totalMembers={members.length}
              pendingLoans={pendingLoans.length}
            />
            <div style={{ marginTop: '24px' }}>
              <DashboardChart
                availableBooks={books.filter((b: any) => b.status === 'AVAILABLE').length}
                borrowedBooks={borrowedBooks.length}
                totalMembers={members.length}
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
              <input
                className="form-control"
                style={{ maxWidth: '360px', background: 'var(--bg-secondary)' }}
                placeholder="Tìm kiếm sách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((c) => (
                  <button key={c} onClick={() => setSelectedCategory(c)} className={`category-pill ${selectedCategory === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
            </div>

            {role === 'USER' ? (
              booksLoading ? (
                <div className="loading-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="book-card-skeleton" />)}</div>
              ) : booksError ? (
                <div className="empty-state"><p>Đã xảy ra lỗi khi tải sách</p></div>
              ) : !books.length ? (
                <div className="empty-state"><p>Không tìm thấy sách nào</p></div>
              ) : (
                <div className="grid-3">{books.map((book: any) => (
                  <BookCard key={book.id} book={book} onBorrow={(id, title) => setBorrowModal({ id, title })} />
                ))}</div>
              )
            ) : (
              <BookTable
                books={books} loading={booksLoading}
                onEdit={(book) => setBookModal(book)}
                onDelete={handleDeleteBook}
                onAdd={() => setBookModal(true)}
              />
            )}
          </div>
        );

      case 'members':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Danh Sách Độc Giả</h2>
              <button onClick={() => setMemberModal(true)} className="btn btn-primary">Thêm Độc Giả</button>
            </div>
            <div className="grid-3" style={{ marginBottom: '32px' }}>
              {members.length ? members.map((m: any) => <MemberCard key={m.id} member={m} onSelect={() => setMemberModal(m)} />)
                : <p style={{ color: 'var(--text-muted)' }}>Chưa có độc giả nào.</p>}
            </div>
            <MemberTable members={members} loading={membersLoading} onEdit={(m: any) => setMemberModal(m)} onDelete={(m: any) => handleDeleteMember(m.id)} />
          </div>
        );

      case 'loans':
        return (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Danh Sách Mượn Trả</h2>
            </div>
<LoanTable
              loans={activeLoans} loading={loansLoading} role={role}
              onApprove={handleApprove} onReject={handleReject}
              onReturn={role === 'MANAGER' ? (loan) => setReturnModal(loan) : handleRequestReturn}
            />
            {completedLoans.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h2 className="section-title">Lịch Sử Mượn Trả</h2>
                <LoanHistory loans={completedLoans} loading={loansLoading} />
              </div>
            )}
          </div>
        );

      case 'providers':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Danh Sách Nhà Cung Cấp</h2>
              <button onClick={() => setProviderModal(true)} className="btn btn-primary">Thêm Nhà Cung Cấp</button>
            </div>
            <ProviderTable providers={providers} loading={providersLoading} onEdit={(p: any) => setProviderModal(p)} onDelete={(p: any) => handleDeleteProvider(p.id)} />
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header role={role} onRoleChange={handleRoleChange} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div style={{ display: 'flex', flex: 1 }}>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <Sidebar activePath={`/${section}`} onNavigate={handleNavigate} role={role} />
        </div>

        <main className="main-content container" style={{ paddingTop: '24px' }}>
          <Navbar title={sectionTitle} role={role} />
          {renderContent()}
        </main>
      </div>

      <Footer />

      <BookModal open={!!bookModal} book={typeof bookModal === 'object' ? bookModal : null} onClose={() => setBookModal(false)} onSubmit={typeof bookModal === 'object' ? handleUpdateBook : handleAddBook} />
      <BorrowModal book={borrowModal} onClose={() => setBorrowModal(null)} onSubmit={handleBorrow} members={members} showToast={showToast} />
      <MemberModal open={!!memberModal} member={typeof memberModal === 'object' ? memberModal : null} onClose={() => setMemberModal(false)} onSubmit={typeof memberModal === 'object' ? handleUpdateMember : handleAddMember} />
      <ProviderModal open={!!providerModal} provider={typeof providerModal === 'object' ? providerModal : null} onClose={() => setProviderModal(false)} onSubmit={typeof providerModal === 'object' ? handleUpdateProvider : handleAddProvider} />
      <ReturnModal open={!!returnModal} loan={returnModal} onConfirm={(id: string) => handleReturn(id)} onCancel={() => setReturnModal(null)} loading={false} isAdmin={role === 'MANAGER'} confirmText={role === 'MANAGER' ? 'Xác Nhận Thu Hồi' : 'Xác Nhận Trả Sách'} />
      <Toast message={toastMessage?.text || ''} type={toastMessage?.type || 'success'} />

      <style>{`
        .sidebar { width: 240px; flex-shrink: 0; border-right: 1px solid var(--border); background: var(--bg-secondary); padding: 12px 0; overflow-y: auto; }
        .sidebar-backdrop { display: none; }
        .sidebar-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 16px; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; transition: all 0.15s ease; border: none; background: none; text-align: left; cursor: pointer; }
        .sidebar-link:hover { background: rgba(255,255,255,0.04); color: var(--text-primary); }
        .sidebar-link.active { background: rgba(99,102,241,0.1); color: var(--primary); border-right: 2px solid var(--primary); }
        .member-card { cursor: pointer; transition: 0.2s; padding: 20px; }
        .member-card:hover { border-color: rgba(99,102,241,0.25); transform: translateY(-2px); }
        .member-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .member-card-header h4 { font-size: 1rem; font-weight: 600; }
        .member-card-email, .member-card-phone { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 4px; }
        .member-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
        .member-card-date { font-size: 0.75rem; color: var(--text-muted); }
        @media (max-width: 768px) {
          .sidebar { position: fixed; top: 0; left: -260px; height: 100vh; z-index: 999; transition: left 0.3s ease; box-shadow: none; }
          .sidebar.open { left: 0; box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
          .sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(9,13,22,0.6); z-index: 998; }
        }
      `}</style>
    </div>
  );
}
