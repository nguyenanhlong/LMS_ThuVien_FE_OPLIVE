'use client';

export default function DashboardCards({ summary, activeCard, onCardClick }: {
  summary: any;
  activeCard: string | null;
  onCardClick: (key: string) => void;
}) {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);
  const currency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const cards = [
    { key: 'books', val: fmt(summary.total_book_titles), lbl: 'T\u1ed5ng \u0111\u1ea7u s\u00e1ch', cls: 'gradient-text' },
    { key: 'available', val: fmt(summary.available_book_copies), lbl: 'S\u00e1ch s\u1eb5n c\u00f3', color: 'var(--success)' },
    { key: 'borrowed', val: fmt(summary.borrowed_book_copies), lbl: '\u0110ang m\u01b0\u1ee3n', color: 'var(--error)' },
    { key: 'members', val: fmt(summary.total_members), lbl: 'T\u1ed5ng \u0111\u1ed9c gi\u1ea3', color: 'var(--primary)' },
    { key: 'pending', val: fmt(summary.pending_loans), lbl: 'Y\u00eau c\u1ea7u ch\u1edd', color: 'var(--warning)' },
    { key: 'overdue', val: fmt(summary.overdue_details), lbl: 'Qu\u00e1 h\u1ea1n', color: 'var(--error)' },
    { key: 'revenue', val: currency(summary.total_revenue), lbl: 'Doanh thu', color: 'var(--success)' },
    { key: '', val: currency(summary.holding_deposit), lbl: 'Ti\u1ec1n c\u1ecdc \u0111ang gi\u1eef', color: 'var(--text-muted)' },
  ];

  return (
    <section className="stats-grid">
      {cards.map((item) => (
        <div
          key={item.key}
          className="stat-card glass-panel"
          onClick={() => onCardClick(item.key)}
          style={{
            cursor: 'pointer',
            outline: activeCard === item.key ? '2px solid var(--primary)' : 'none',
            outlineOffset: -2,
            transition: 'outline 0.2s ease, transform 0.15s ease',
            transform: activeCard === item.key ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div className={`stat-val ${item.cls || ''}`} style={item.color ? { color: item.color } : undefined}>{item.val}</div>
          <div className="stat-lbl">{item.lbl}</div>
        </div>
      ))}
    </section>
  );
}