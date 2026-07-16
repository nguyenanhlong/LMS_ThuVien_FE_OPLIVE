'use client';

const btnStyle = (disabled?: boolean) => ({
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: '0.8125rem',
  minWidth: 32,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
  cursor: disabled ? 'default' : 'pointer',
  lineHeight: 1,
  opacity: disabled ? 0.5 : 1,
});

export default function Pagination({ currentPage, totalPages, onPageChange }: any) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 16 }}>
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} type="button" style={btnStyle(currentPage <= 1)}>‹</button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} type="button" style={btnStyle()}>1</button>
          {start > 2 && <span style={{ color: 'var(--text-muted)', padding: '0 4px', fontSize: '0.8125rem' }}>...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          type="button"
          style={{
            ...btnStyle(),
            border: p === currentPage ? 'none' : '1px solid var(--border-color)',
            background: p === currentPage ? 'var(--accent)' : 'var(--bg-secondary)',
            color: p === currentPage ? '#fff' : 'var(--text-primary)',
            fontWeight: p === currentPage ? 600 : 400,
          }}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px', fontSize: '0.8125rem' }}>...</span>}
          <button onClick={() => onPageChange(totalPages)} type="button" style={btnStyle()}>{totalPages}</button>
        </>
      )}

      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} type="button" style={btnStyle(currentPage >= totalPages)}>›</button>
    </div>
  );
}
