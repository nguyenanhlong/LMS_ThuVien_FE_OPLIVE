'use client';

const allNavItems = [
  {
    label: 'Tổng Quan', path: '/dashboard',
    roles: ['MANAGER', 'ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    label: 'Sách', path: '/books',
    roles: ['USER', 'MANAGER', 'ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  },
  {
    label: 'Độc Giả', path: '/users',
    roles: ['ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    label: 'Danh Mục', path: '/categories',
    roles: ['ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  },
  {
    label: 'Danh Mục Con', path: '/subcategories',
    roles: ['ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><path d="M9 14l2 2 4-4" stroke="var(--text-muted)"/></svg>,
  },
  {
    label: 'Phân Quyền', path: '/permissions',
    roles: ['ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  },
  {
    label: 'Mượn Trả', path: '/loans',
    roles: ['USER', 'MANAGER', 'ADMIN'],
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  },
];
export default function Sidebar({
  activePath, onNavigate, role,
}: {
  activePath: string;
  onNavigate: (path: string) => void;
  role: 'USER' | 'MANAGER' | 'ADMIN';
}) {
  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
        {role === 'USER' ? 'Người Đọc' : 'Quản Thủ'}
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`sidebar-link ${activePath === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
