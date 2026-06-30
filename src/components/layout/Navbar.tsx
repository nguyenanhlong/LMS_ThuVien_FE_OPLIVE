'use client';

export default function Navbar({
  title,
  role,
}: {
  title: string;
  role: 'USER' | 'MANAGER';
}) {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <span className={`role-badge ${role === 'MANAGER' ? 'role-badge--manager' : ''}`}>
          {role === 'MANAGER' ? 'Quản Thủ' : 'Người Đọc'}
        </span>
      </div>
    </div>
  );
}
