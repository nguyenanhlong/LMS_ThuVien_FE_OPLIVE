'use client';

export default function Card({ children, className = '', hover = true }: any) {
  return <div className={`glass-panel${hover ? ' card-hover' : ''} ${className}`}>{children}</div>;
}
