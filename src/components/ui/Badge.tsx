'use client';

export default function Badge({ variant = 'muted', children }: any) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
