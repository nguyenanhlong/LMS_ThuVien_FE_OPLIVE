'use client';

import { useState, useEffect, useCallback } from 'react';
import { graphqlQuery } from '@/lib/api';
import { mapBook, mapLoan } from '@/utils/mappers';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardChart from '@/components/dashboard/DashboardChart';
import RecentLoans from '@/components/dashboard/RecentLoans';

export default function DashboardSection() {
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, loanRes] = await Promise.all([
        graphqlQuery(`
          query GetBooks($query: GetBooksInput) {
            books(query: $query) {
              items {
                id
                title
                author
                publisher
                description
                total_quantity
                borrowed_quantity
              }
            }
          }
        `, { query: { pageSize: 100 } }),
        graphqlQuery(`
          query GetLoans($query: GetLoansInput) {
            loans(query: $query) {
              items {
                id
                loan_date
                status
                borrower {
                  user_id
                  full_name
                }
                books {
                  book_id
                  title
                  author
                  due_date
                  return_date
                }
              }
            }
          }
        `, { query: { pageSize: 100 } })
      ]);
      setBooks((bookRes.books?.items || []).map(mapBook));
      setLoans((loanRes.loans?.items || []).map(mapLoan));
    } catch { /* ignore */ }
    try {
      const userRes = await graphqlQuery(`
        query GetUsers {
          users { id role }
        }
      `);
      setUsers((userRes.users || []).filter((u: any) => u.role === 'MEMBER'));
    } catch { setUsers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeLoans = loans.filter((l: any) => !['COMPLETED', 'CANCELLED'].includes(l.status));
  const pendingLoans = loans.filter((l: any) => l.status === 'PENDING');

  if (loading && !books.length) return <div className="empty-state"><p>Đang tải dữ liệu...</p></div>;

  return (
    <>
      <DashboardCards
        totalBooks={books.length}
        availableBooks={books.filter((b: any) => b.status === 'AVAILABLE').length}
        borrowedBooks={activeLoans.length}
        totalMembers={users.length}
        pendingLoans={pendingLoans.length}
      />
      <div style={{ marginTop: '24px' }}>
        <DashboardChart
          availableBooks={books.filter((b: any) => b.status === 'AVAILABLE').length}
          borrowedBooks={activeLoans.length}
          totalMembers={users.length}
          pendingLoans={pendingLoans.length}
        />
      </div>
      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">Hoạt Động Gần Đây</h2>
        <RecentLoans loans={[...loans].reverse().slice(0, 5)} loading={loading} />
      </div>
    </>
  );
}
