'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummaryApi, getDashboardLoanStatusApi, getDashboardTopBooksApi, graphqlQuery } from '@/lib/api';
import { mapLoan, resolveImageUrl } from '@/utils/mappers';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardChart from '@/components/dashboard/DashboardChart';
import RecentLoans from '@/components/dashboard/RecentLoans';

export default function DashboardSection() {
  const [summary, setSummary] = useState<any>(null);
  const [loanStats, setLoanStats] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { setSummary(await getDashboardSummaryApi()); } catch (e) { console.error('Summary:', e); }
    try { setLoanStats(await getDashboardLoanStatusApi()); } catch (e) { console.error('LoanStats:', e); }
    try { setTopBooks(await getDashboardTopBooksApi(5)); } catch (e) { console.error('TopBooks:', e); }

    try {
      const loanRes = await graphqlQuery(`
        query ($query: GetLoansInput) {
          loans(query: $query) {
            items {
              id loan_date status
              borrower { user_id full_name }
              books { book_id title author due_date completed_at status }
            }
          }
        }
      `, { query: { pageSize: 5 } });
    setRecentLoans(((loanRes as any).loans?.items || []).map(mapLoan));
    } catch { setRecentLoans([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !summary) return <div className="empty-state"><p>{'\u0110ang t\u1ea3i d\u1eef li\u1ec7u...'}</p></div>;

  return (
    <>
      {summary && <DashboardCards summary={summary} />}

      {topBooks.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 className="section-title">{'S\u00e1ch \u0110\u01b0\u1ee3c M\u01b0\u1ee3n Nhi\u1ec1u Nh\u1ea5t'}</h2>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topBooks.map((book: any, i: number) => (
                <div key={book.book_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < topBooks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  {book.image_url && (
                    <img src={resolveImageUrl(book.image_url)} alt="" style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{book.title}</div>
                    {book.author && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{book.author}</div>}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {book.borrowed_quantity} {'\u0111\u1ea7u s\u00e1ch'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <DashboardChart data={loanStats} />
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2 className="section-title">{'Ho\u1ea1t \u0110\u1ed9ng G\u1ea7n \u0110\u00e2y'}</h2>
        <RecentLoans loans={recentLoans} loading={loading} />
      </div>
    </>
  );
}