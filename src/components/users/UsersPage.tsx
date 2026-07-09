'use client';

export default function UsersPage({ users, usersLoading, onEditUser, onUpdateUser }: any) {
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
                    <button onClick={() => onEditUser(u)} className="btn btn-edit" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
