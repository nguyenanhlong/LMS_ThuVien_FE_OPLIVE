'use client';

import StaffLayout from '@/modules/staff/StaffLayout';
import DashboardSection from '@/modules/staff/DashboardSection';
import BooksSection from '@/modules/staff/BooksSection';
import LoansSection from '@/modules/staff/LoansSection';

export default function LibrarianModule() {
  return (
    <StaffLayout defaultSection="dashboard" allowedSections={['dashboard', 'books', 'loans']}>
      {(section: string) => (
        <>
          {section === 'dashboard' && <DashboardSection />}
          {section === 'books' && <BooksSection />}
          {section === 'loans' && <LoansSection />}
        </>
      )}
    </StaffLayout>
  );
}
