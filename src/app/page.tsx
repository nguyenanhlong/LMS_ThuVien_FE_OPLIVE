'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import AuthModule from '@/modules/auth/AuthModule';
import MemberModule from '@/modules/member/MemberModule';
import LibrarianModule from '@/modules/librarian/LibrarianModule';
import AdminModule from '@/modules/admin/AdminModule';

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  const roleTitle: Record<string, string> = {
    MEMBER: 'Thư Viện Số - Tra Cứu',
    LIBRARIAN: 'Thư Viện Số - Thủ Thư',
    ADMIN: 'Thư Viện Số - Quản Lý',
  };

  useEffect(() => {
    if (user) document.title = roleTitle[user.role] || 'Thư Viện Số';
  }, [user]);

  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  }

  if (!user) return <AuthModule />;
  if (user.role === 'MEMBER') return <MemberModule />;
  if (user.role === 'LIBRARIAN') return <LibrarianModule />;
  if (user.role === 'ADMIN') return <AdminModule />;
  return <AuthModule />;
}
