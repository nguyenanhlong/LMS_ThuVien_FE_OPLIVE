'use client';

export default function DashboardCards({ summary }: { summary: any }) {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
  const currency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <section className="stats-grid">
      {[
        { val: fmt(summary.total_book_titles), lbl: 'Tổng đầu sách', cls: 'gradient-text' },
        { val: fmt(summary.available_book_copies), lbl: 'Sách sẵn có', cls: '', color: 'var(--success)' },
        { val: fmt(summary.borrowed_book_copies), lbl: 'Đang mượn', cls: '', color: 'var(--error)' },
        { val: fmt(summary.total_members), lbl: 'Tổng độc giả', cls: '', color: 'var(--primary)' },
        { val: fmt(summary.pending_loans), lbl: 'Yêu cầu chờ', cls: '', color: 'var(--warning)' },
        { val: fmt(summary.overdue_details), lbl: 'Quá hạn', cls: '', color: 'var(--error)' },
        { val: currency(summary.total_revenue), lbl: 'Doanh thu', cls: '', color: 'var(--success)' },
        { val: currency(summary.holding_deposit), lbl: 'Tiền cọc đang giữ', cls: '', color: 'var(--text-muted)' },
      ].map((item, i) => (
        <div key={i} className="stat-card glass-panel">
          <div className={`stat-val ${item.cls}`} style={item.color ? { color: item.color } : undefined}>{item.val}</div>
          <div className="stat-lbl">{item.lbl}</div>
        </div>
      ))}
    </section>
  );
}