'use client';

import StaffLayout from '@/modules/staff/StaffLayout';
import DashboardSection from '@/modules/staff/DashboardSection';
import BooksSection from '@/modules/staff/BooksSection';
import LoansSection from '@/modules/staff/LoansSection';
import UsersSection from '@/modules/staff/UsersSection';

export default function AdminModule() {
  return (
    <StaffLayout defaultSection="dashboard" allowedSections={['dashboard', 'books', 'users', 'loans']}>
      {(section: string) => (
        <>
          {section === 'dashboard' && <DashboardSection />}
          {section === 'books' && <BooksSection />}
          {section === 'loans' && <LoansSection />}
          {section === 'users' && <UsersSection />}
        </>
      )}
    </StaffLayout>
  );
}
