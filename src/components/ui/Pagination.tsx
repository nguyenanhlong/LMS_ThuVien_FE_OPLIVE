'use client';

export default function Pagination({ currentPage, totalPages, onPageChange }: any) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="btn btn-muted"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 4l-4 4 4 4" />
        </svg>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`btn ${page === currentPage ? 'btn-primary' : 'btn-muted'}`}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}

      <button
        className="btn btn-muted"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
}
