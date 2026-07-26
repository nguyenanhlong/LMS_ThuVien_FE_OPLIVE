'use client';

import StaffLayout from '@/modules/staff/StaffLayout';
import DashboardSection from '@/modules/staff/DashboardSection';
import BooksSection from '@/modules/staff/BooksSection';
import LoansSection from '@/modules/staff/LoansSection';
import UsersSection from '@/modules/staff/UsersSection';
import CategoriesSection from '@/modules/admin/CategoriesSection';

export default function LibrarianModule() {
  return (
    <StaffLayout defaultSection="dashboard" allowedSections={['dashboard', 'books', 'users', 'loans', 'categories']}>
      {(section: string, permissions: string[], userRole?: string) => (
        <>
          {section === 'dashboard' && <DashboardSection />}
          {section === 'books' && <BooksSection />}
          {section === 'loans' && <LoansSection />}
          {section === 'users' && <UsersSection permissions={permissions} userRole={userRole} />}
          {section === 'categories' && <CategoriesSection permissions={permissions} userRole={userRole} />}
        </>
      )}
    </StaffLayout>
  );
}
