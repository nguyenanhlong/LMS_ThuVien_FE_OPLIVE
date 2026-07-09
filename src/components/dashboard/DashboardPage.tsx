'use client';

import DashboardCards from './DashboardCards';
import DashboardChart from './DashboardChart';
import RecentLoans from './RecentLoans';

export default function DashboardPage({ books, activeLoans, users, pendingLoans, loans, loansLoading }: any) {
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
        <RecentLoans loans={[...loans].reverse().slice(0, 5)} loading={loansLoading} />
      </div>
    </>
  );
}
