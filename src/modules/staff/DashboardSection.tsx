'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDashboardSummaryApi, getDashboardLoanStatusApi, getDashboardTopBooksApi, getBooksApi, getLoansApi, graphqlQuery, getRolePermissionsByRoleApi } from '@/lib/api';
import { mapLoan, mapBook, resolveImageUrl } from '@/utils/mappers';
import { PERMISSIONS, hasPermission } from '@/utils/permissions';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardChart from '@/components/dashboard/DashboardChart';
import DashboardTimeline from '@/components/dashboard/DashboardTimeline';
import RecentLoans from '@/components/dashboard/RecentLoans';
import Badge from '@/components/ui/Badge';

const LOAN_STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Ch\u1edd x\u00e1c nh\u1eadn', variant: 'info' },
  PENDING_PAYMENT: { label: 'Ch\u1edd thanh to\u00e1n', variant: 'warning' },
  BORROWING: { label: '\u0110ang m\u01b0\u1ee3n', variant: 'success' },
  COMPLETED: { label: '\u0110\u00e3 ho\u00e0n t\u1ea5t', variant: 'muted' },
  CANCELLED: { label: '\u0110\u00e3 h\u1ee7y', variant: 'muted' },
  OVERDUE: { label: 'Qu\u00e1 h\u1ea1n', variant: 'danger' },
};

const NAV_LABELS: Record<string, { section: string; label: string }> = {
  books: { section: 'books', label: 'Qu\u1EA3n l\u00FD s\u00E1ch \u2192' },
  available: { section: 'books', label: 'Qu\u1EA3n l\u00FD s\u00E1ch \u2192' },
  borrowed: { section: 'loans', label: 'Qu\u1EA3n l\u00FD m\u01B0\u1EE3n tr\u1EA3 \u2192' },
  pending: { section: 'loans', label: 'Qu\u1EA3n l\u00FD m\u01B0\u1EE3n tr\u1EA3 \u2192' },
  overdue: { section: 'loans', label: 'Qu\u1EA3n l\u00FD m\u01B0\u1EE3n tr\u1EA3 \u2192' },
  members: { section: 'users', label: 'Qu\u1EA3n l\u00FD \u0111\u1ED9c gi\u1EA3 \u2192' },
};

export default function DashboardSection({ onNavigate, permissions, userRole }: { onNavigate?: (section: string) => void; permissions?: string[]; userRole?: string }) {
  const isAdmin = userRole === 'ADMIN';
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    if (userRole === 'ADMIN') { setAllowed(true); return; }
    if (!userRole) { setAllowed(hasPermission(permissions, PERMISSIONS.DASHBOARD_VIEW)); return; }
    getRolePermissionsByRoleApi(userRole)
      .then((data: any) => {
        const ok = (Array.isArray(data) ? data : []).some((p: any) => p.permission === PERMISSIONS.DASHBOARD_VIEW);
        if (active) setAllowed(ok);
      })
      .catch(() => { if (active) setAllowed(hasPermission(permissions, PERMISSIONS.DASHBOARD_VIEW)); });
    return () => { active = false; };
  }, [userRole]);

  const canViewStats = isAdmin || allowed === true;

  const [summary, setSummary] = useState<any>(null);
  const [loanStats, setLoanStats] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [cardDetail, setCardDetail] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!canViewStats) { setLoading(false); return; }
    try { setSummary(await getDashboardSummaryApi()); } catch (e) { console.error('Summary:', e); }
    try { setLoanStats(await getDashboardLoanStatusApi()); } catch (e) { console.error('LoanStats:', e); }
    try { setTopBooks(await getDashboardTopBooksApi(5)); } catch (e) { console.error('TopBooks:', e); }
    try {
      const loanRes = await graphqlQuery(`
        query ($query: GetLoansInput) {
          loans(query: $query) {
            items { id loan_date status borrower { user_id full_name } books { book_id title author due_date completed_at status } }
          }
        }
      `, { query: { pageSize: 5 } });
      setRecentLoans(((loanRes as any).loans?.items || []).map(mapLoan));
    } catch { setRecentLoans([]); }
    setLoading(false);
  }, [canViewStats]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCardClick = async (key: string) => {
    if (!key || activeCard === key) { setActiveCard(null); setCardDetail([]); return; }
    setActiveCard(key);
    setDetailLoading(true);
    setCardDetail([]);
    try {
      switch (key) {
        case 'books':
        case 'available': {
          const res = await getBooksApi({ pageSize: 100 });
          const all = (res.items || []).map(mapBook);
          setCardDetail(key === 'available' ? all.filter((b: any) => b.available_quantity > 0) : all);
          break;
        }
        case 'borrowed': {
          const res = await getLoansApi({ status: 'BORROWING', pageSize: 100 });
          setCardDetail((res.items || []).map(mapLoan));
          break;
        }
        case 'pending': {
          const res = await getLoansApi({ status: 'PENDING', pageSize: 100 });
          setCardDetail((res.items || []).map(mapLoan));
          break;
        }
        case 'overdue': {
          const res = await getLoansApi({ pageSize: 100 });
          setCardDetail((res.items || []).map(mapLoan).filter((l: any) => l.status === 'OVERDUE'));
          break;
        }
        case 'revenue': {
          if (summary) setCardDetail([
            { label: 'Ph\u00ed thu\u00ea', value: summary.rental_revenue },
            { label: 'Ti\u1ec1n ph\u1ea1t tr\u1ec5', value: summary.fine_revenue },
            { label: 'B\u1ed3i th\u01b0\u1eddng s\u00e1ch m\u1ea5t', value: summary.lost_book_revenue },
            { label: 'T\u1ed5ng doanh thu', value: summary.total_revenue },
          ]);
          break;
        }
        case 'members': {
          try {
            const res = await graphqlQuery(`query { users { items { id username full_name email role is_active } } }`);
            const members = ((res as any).users?.items || []).filter((u: any) => u.role === 'MEMBER' && u.is_active);
            members.sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || '', 'vi'));
            setCardDetail(members);
          } catch { setCardDetail([]); }
          break;
        }
        default: setCardDetail([]);
      }
    } catch { setCardDetail([]); }
    setDetailLoading(false);
  };

  const fmtCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const navInfo = activeCard ? NAV_LABELS[activeCard] : null;

  if (!isAdmin && allowed === null) return <div className="empty-state"><p>{'\u0110ang t\u1ea3i...'}</p></div>;

  if (!canViewStats) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p>Bạn không có quyền xem thống kê. Vui lòng liên hệ quản trị viên.</p>
      </div>
    );
  }

  if (loading && !summary) return <div className="empty-state"><p>{'\u0110ang t\u1ea3i...'}</p></div>;

  return (
    <>
      {summary && <DashboardCards summary={summary} activeCard={activeCard} onCardClick={handleCardClick} />}

      {activeCard && (
        <div className="glass-panel" style={{ marginTop: 16, padding: 20 }}>
          {detailLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>{'\u0110ang t\u1ea3i...'}</p>
          ) : cardDetail.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>{'Kh\u00f4ng c\u00f3 d\u1eef li\u1ec7u'}</p>
          ) : activeCard === 'members' ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cardDetail.slice(0, 5).map((u: any, i: number) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < Math.min(cardDetail.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                      {(u.full_name || u.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.full_name || u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeCard === 'revenue' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px 24px', fontSize: '0.9rem' }}>
              {cardDetail.map((item: any, i: number) => (
                <div key={i} style={{ display: 'contents' }}>
                  <span style={{ color: i === cardDetail.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === cardDetail.length - 1 ? 700 : 400 }}>{item.label}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: i === cardDetail.length - 1 ? 'var(--primary)' : 'var(--success)' }}>
                    {fmtCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (activeCard === 'books' || activeCard === 'available') ? (
            <div className="table-wrapper">
              <table className="custom-table">
                <thead><tr><th>{'T\u00ean s\u00e1ch'}</th><th>{'T\u00e1c gi\u1ea3'}</th><th>{'T\u1ed5ng'}</th><th>{'C\u00f2n'}</th><th>{'\u0110ang m\u01b0\u1ee3n'}</th></tr></thead>
                <tbody>
                  {cardDetail.slice(0, 5).map((b: any) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.title}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{b.author}</td>
                      <td>{b.total_quantity}</td>
                      <td style={{ color: b.available_quantity > 0 ? 'var(--success)' : 'var(--error)' }}>{b.available_quantity}</td>
                      <td>{b.borrowed_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="custom-table">
                <thead><tr><th>{'\u0110\u1ed9c gi\u1ea3'}</th><th>{'S\u00e1ch'}</th><th>{'Ng\u00e0y m\u01b0\u1ee3n'}</th><th>{'H\u1ea1n tr\u1ea3'}</th><th>{'Tr\u1ea1ng th\u00e1i'}</th></tr></thead>
                <tbody>
                  {cardDetail.slice(0, 5).map((l: any) => {
                    const s = LOAN_STATUS_LABELS[l.status] || { label: l.status, variant: 'muted' };
                    return (
                      <tr key={l.id}>
                        <td>{l.userName}</td>
                        <td style={{ fontWeight: 600 }}>{(l.details?.length || 0) > 1 ? `${l.details.length} \u0111\u1ea7u s\u00e1ch` : l.bookTitles}</td>
                        <td>{l.requestDate || '\u2014'}</td>
                        <td>{l.dueDate || '\u2014'}</td>
                        <td><Badge variant={s.variant}>{s.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* N\u00fat chuy\u1ec3n sang section t\u01b0\u01a1ng \u1ee9ng */}
          {navInfo && onNavigate && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button className="btn btn-primary" style={{ padding: '8px 24px', fontSize: '0.85rem' }} onClick={() => onNavigate(navInfo.section)}>
                {navInfo.label}
              </button>
            </div>
          )}
        </div>
      )}

      {topBooks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 className="section-title">{'S\u00e1ch \u0110\u01b0\u1ee3c M\u01b0\u1ee3n Nhi\u1ec1u Nh\u1ea5t'}</h2>
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topBooks.map((book: any, i: number) => (
                <div key={book.book_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < topBooks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  {book.image_url && <img src={resolveImageUrl(book.image_url)} alt="" style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{book.title}</div>
                    {book.author && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{book.author}</div>}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{book.borrowed_quantity} {'\u0111\u1ea7u s\u00e1ch'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}><DashboardChart data={loanStats} /></div>
      <div style={{ marginTop: 24 }}><DashboardTimeline /></div>
      <div style={{ marginTop: 24 }}>
        <h2 className="section-title">{'Ho\u1ea1t \u0110\u1ed9ng G\u1ea7n \u0110\u00e2y'}</h2>
        <RecentLoans loans={recentLoans} loading={loading} />
      </div>
    </>
  );
}