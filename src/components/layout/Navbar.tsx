'use client';

export default function Navbar({
  title,
}: {
  title: string;
  role?: 'USER' | 'MANAGER';
}) {
  return (
    <div className="navbar">
      <h1 className="navbar-title">{title}</h1>
    </div>
  );
}
