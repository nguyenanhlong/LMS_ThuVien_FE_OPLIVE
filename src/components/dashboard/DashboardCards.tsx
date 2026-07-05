'use client';

export default function DashboardCards({ totalBooks, availableBooks, borrowedBooks, totalMembers, pendingLoans }: {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalMembers: number;
  pendingLoans: number;
}) {
  return (
    <section className="stats-grid">
      {[
        { val: totalBooks, lbl: 'Tổng đầu sách', cls: 'gradient-text' },
        { val: availableBooks, lbl: 'Sách sẵn có', cls: '', color: 'var(--success)' },
        { val: borrowedBooks, lbl: 'Đang mượn', cls: '', color: 'var(--error)' },
        { val: totalMembers, lbl: 'Tổng độc giả', cls: '', color: 'var(--primary)' },
        { val: pendingLoans, lbl: 'Yêu cầu chờ', cls: '', color: 'var(--warning)' },
      ].map((item, i) => (
        <div key={i} className="stat-card glass-panel">
          <div className={`stat-val ${item.cls}`} style={item.color ? { color: item.color } : undefined}>{item.val}</div>
          <div className="stat-lbl">{item.lbl}</div>
        </div>
      ))}
    </section>
  );
}
