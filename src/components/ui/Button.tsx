'use client';

export default function Button({ children, variant = 'primary', className = '', full = false, disabled = false, onClick, id, ...props }: any) {
  const cls = `btn btn-${variant}${full ? ' btn-full' : ''} ${className}`;
  return <button className={cls} disabled={disabled} onClick={onClick} id={id} {...props}>{children}</button>;
}
