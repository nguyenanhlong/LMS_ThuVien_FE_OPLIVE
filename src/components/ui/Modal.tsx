'use client';

export default function Modal({ open, title, subtitle, children, onClose }: any) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose} type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
