'use client';

import StaffLayout from '@/modules/staff/StaffLayout';
import DashboardSection from '@/modules/staff/DashboardSection';
import BooksSection from '@/modules/staff/BooksSection';
import LoansSection from '@/modules/staff/LoansSection';
import UsersSection from '@/modules/staff/UsersSection';
import CategoriesSection from '@/modules/admin/CategoriesSection';
import SubCategoriesSection from '@/modules/admin/SubCategoriesSection';

export default function LibrarianModule() {
  return (
    <StaffLayout defaultSection="dashboard" allowedSections={['dashboard', 'books', 'users', 'loans', 'categories', 'subcategories']}>
      {(section: string, permissions: string[]) => (
        <>
          {section === 'dashboard' && <DashboardSection />}
          {section === 'books' && <BooksSection />}
          {section === 'loans' && <LoansSection />}
          {section === 'users' && <UsersSection permissions={permissions} />}
          {section === 'categories' && <CategoriesSection permissions={permissions} />}
          {section === 'subcategories' && <SubCategoriesSection permissions={permissions} />}
        </>
      )}
    </StaffLayout>
  );
}
