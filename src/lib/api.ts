export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

function isAuthError(errors: any[]) {
  return errors.some((e) => {
    const code = e?.extensions?.code;
    const status = e?.extensions?.originalError?.statusCode;
    return code === 'UNAUTHENTICATED' || status === 401 || /unauthorized/i.test(e?.message || '');
  });
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation RefreshToken($input: RefreshInput!) { refreshToken(input: $input) { access_token } }`,
        variables: { input: { refresh_token: refresh } },
      }),
    });
    const json = await res.json();
    if (json.errors?.length) { clearTokens(); return null; }
    const token = json.data?.refreshToken?.access_token;
    if (token) setTokens(token);
    return token;
  } catch { clearTokens(); return null; }
}

// Client GraphQL dùng chung cho mọi query/mutation (thay cho api() REST cũ vì backend đã bỏ hẳn REST).
export async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  let json = await res.json();

  if (json.errors?.length && isAuthError(json.errors) && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
      json = await res.json();
    }
  }

  if (json.errors?.length) {
    const msg = json.errors[0]?.message || 'Đã có lỗi xảy ra';
    throw new Error(msg);
  }
  return json.data as T;
}

// Alias giữ tương thích với các module Staff/Admin (Long) đang gọi trực tiếp graphqlQuery(...).
export { gql as graphqlQuery };

export async function loginApi(username: string, password: string) {
  const data = await gql<{ login: { access_token: string; refresh_token: string } }>(
    `mutation Login($input: LoginInput!) { login(input: $input) { access_token refresh_token } }`,
    { input: { username, password } },
  );
  const tokens = data.login;
  if (tokens?.access_token) setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
}

export async function registerApi(data: { username: string; full_name: string; email: string; password: string }) {
  const result = await gql<{ register: any }>(
    `mutation Register($input: RegisterInput!) { register(input: $input) { id username email full_name } }`,
    { input: data },
  );
  return result.register;
}

export { getToken, clearTokens };

const BOOK_FIELDS = `
  id title isbn author image_url publisher publisher_year description
  total_quantity borrowed_quantity max_borrow_days
  deposit_amount fine_per_day replacement_cost fee_per_day fee_per_week fee_per_month
  is_active sub_category_id sub_category { id name category { id name } }
`;

export async function getBooksApi(params?: { keyword?: string; category_id?: number; sub_category_id?: number; author?: string; is_active?: boolean; page?: number; pageSize?: number }) {
  const data = await gql<{ books: any }>(
    `query Books($query: GetBooksInput) { books(query: $query) { pageNumber pageSize totalItems totalPages items { ${BOOK_FIELDS} } } }`,
    { query: { keyword: params?.keyword, category_id: params?.category_id, sub_category_id: params?.sub_category_id, author: params?.author, is_active: params?.is_active, page: params?.page, pageSize: params?.pageSize ?? 100 } },
  );
  return data.books;
}

export async function getBookApi(id: string | number) {
  const data = await gql<{ book: any }>(
    `query Book($id: ID!) { book(id: $id) { ${BOOK_FIELDS} } }`,
    { id },
  );
  return data.book;
}

export async function uploadBookImageApi(id: string | number, file: File) {
  const query = `mutation($id: ID!, $file: Upload!) { updateBookImage(id: $id, image: $file) { id image_url } }`;
  const variables = { id: String(id), file: null };
  const map = { '0': ['variables.file'] };
  const form = new FormData();
  form.append('operations', JSON.stringify({ query, variables }));
  form.append('map', JSON.stringify(map));
  form.append('0', file);
  const token = getToken();
  const res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'apollo-require-preflight': 'true' },
    body: form,
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message || 'Upload failed');
  return json.data?.updateBookImage;
}

export function getCachedPermissions(role: string): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(`permissions_${role}`) || '[]'); }
  catch { return []; }
}

export function setCachedPermissions(role: string, perms: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`permissions_${role}`, JSON.stringify(perms));
}

export async function createBookApi(data: any) {
  const result = await gql<{ createBook: any }>(
    `mutation CreateBook($input: CreateBookInput!) { createBook(input: $input) { id } }`,
    { input: data },
  );
  return result.createBook;
}

export async function updateBookApi(id: string | number, data: any) {
  const result = await gql<{ updateBook: any }>(
    `mutation UpdateBook($id: ID!, $input: UpdateBookInput!) { updateBook(id: $id, input: $input) { id } }`,
    { id: String(id), input: data },
  );
  return result.updateBook;
}

export async function deleteBookApi(id: string | number) {
  const result = await gql<{ deleteBook: boolean }>(
    `mutation DeleteBook($id: ID!) { deleteBook(id: $id) }`,
    { id: String(id) },
  );
  return result.deleteBook;
}

const LOAN_FIELDS = `
  id loan_date status cancelled_reason
  total_deposit total_rental_fee total_amount total_fine total_lost_fee
  total_initial_payment total_deposit_refund total_extra_payment
  borrower { user_id full_name email }
  books {
    loan_detail_id book_id title author image_url quantity
    returned_quantity lost_quantity remaining_quantity
    borrow_days due_date completed_at status
    deposit_amount rental_fee fine_amount lost_fee deposit_refund_amount extra_payment_amount
    returned_histories { id return_date return_quantity lost_quantity late_days fine_amount lost_fee deposit_refund_amount extra_payment_amount note }
  }
`;

export async function getLoansApi(params?: { status?: string; pageSize?: number }) {
  const data = await gql<{ loans: any }>(
    `query Loans($query: GetLoansInput) { loans(query: $query) { pageNumber pageSize totalItems totalPages items { ${LOAN_FIELDS} } } }`,
    { query: { status: params?.status, pageSize: params?.pageSize ?? 100 } },
  );
  return data.loans;
}

export async function getLoanByIdApi(id: string | number) {
  const data = await gql<{ loan: any }>(
    `query Loan($id: ID!) { loan(id: $id) { ${LOAN_FIELDS} } }`,
    { id: String(id) },
  );
  return data.loan;
}

export async function createLoanApi(items: { book_id: number; quantity: number; borrow_days: number }[]) {
  const data = await gql<{ createLoan: any }>(
    `mutation CreateLoan($input: CreateLoanInput!) { createLoan(input: $input) { ${LOAN_FIELDS} } }`,
    { input: { items } },
  );
  return data.createLoan;
}

export async function confirmLoanApi(id: string | number) {
  const data = await gql<{ confirmLoan: boolean }>(
    `mutation ConfirmLoan($id: ID!) { confirmLoan(id: $id) }`,
    { id: String(id) },
  );
  return data.confirmLoan;
}

export async function borrowingLoanApi(id: string | number) {
  const data = await gql<{ payAndBorrow: boolean }>(
    `mutation PayAndBorrow($id: ID!) { payAndBorrow(id: $id) }`,
    { id: String(id) },
  );
  return data.payAndBorrow;
}

export async function returnLoanDetailApi(detailId: string | number, input: { return_quantity: number; lost_quantity?: number; note?: string }) {
  const data = await gql<{ returnLoanDetail: boolean }>(
    `mutation ReturnLoanDetail($detailId: ID!, $input: ReturnDetailInput!) { returnLoanDetail(detailId: $detailId, input: $input) }`,
    { detailId: String(detailId), input },
  );
  return data.returnLoanDetail;
}

export async function cancelLoanApi(id: string | number, cancelled_reason: string) {
  const data = await gql<{ cancelLoan: boolean }>(
    `mutation CancelLoan($id: ID!, $input: CancelLoanInput!) { cancelLoan(id: $id, input: $input) }`,
    { id, input: { cancelled_reason } },
  );
  return data.cancelLoan;
}

export async function getCategoriesApi() {
  const data = await gql<{ categories: any[] }>(
    `query Categories { categories { id name created_at updated_at sub_categories { id name } } }`,
  );
  return data.categories;
}

export async function createCategoryApi(name: string) {
  const data = await gql<{ createCategory: any }>(
    `mutation CreateCategory($input: CreateCategoryInput!) { createCategory(input: $input) { id name } }`,
    { input: { name } },
  );
  return data.createCategory;
}

export async function updateCategoryApi(id: string | number, name: string) {
  const data = await gql<{ updateCategory: any }>(
    `mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) { updateCategory(id: $id, input: $input) { id name } }`,
    { id: String(id), input: { name } },
  );
  return data.updateCategory;
}

export async function deleteCategoryApi(id: string | number) {
  const data = await gql<{ deleteCategory: boolean }>(
    `mutation DeleteCategory($id: ID!) { deleteCategory(id: $id) }`,
    { id: String(id) },
  );
  return data.deleteCategory;
}

export async function getSubCategoriesApi(categoryId?: number) {
  const data = await gql<{ subCategories: any[] }>(
    `query SubCategories($categoryId: Int) { subCategories(categoryId: $categoryId) { id category_id name } }`,
    { categoryId },
  );
  return data.subCategories;
}

export async function createSubCategoryApi(category_id: number, name: string) {
  const data = await gql<{ createSubCategory: any }>(
    `mutation CreateSubCategory($input: CreateSubCategoryInput!) { createSubCategory(input: $input) { id name category_id } }`,
    { input: { category_id, name } },
  );
  return data.createSubCategory;
}

export async function updateSubCategoryApi(id: string | number, data: { category_id?: number; name?: string }) {
  const result = await gql<{ updateSubCategory: any }>(
    `mutation UpdateSubCategory($id: ID!, $input: UpdateSubCategoryInput!) { updateSubCategory(id: $id, input: $input) { id name category_id } }`,
    { id: String(id), input: data },
  );
  return result.updateSubCategory;
}

export async function deleteSubCategoryApi(id: string | number) {
  const data = await gql<{ deleteSubCategory: boolean }>(
    `mutation DeleteSubCategory($id: ID!) { deleteSubCategory(id: $id) }`,
    { id: String(id) },
  );
  return data.deleteSubCategory;
}

export async function getRolePermissionsApi() {
  const data = await gql<{ rolePermissions: any[] }>(
    `query GetRolePermissions { rolePermissions { id role permission } }`,
  );
  return data.rolePermissions;
}

export async function getRolePermissionsByRoleApi(role: string) {
  const data = await gql<{ rolePermissionsByRole: any[] }>(
    `query GetRolePermissionsByRole($role: UserRole!) { rolePermissionsByRole(role: $role) { id role permission } }`,
    { role },
  );
  return data.rolePermissionsByRole;
}

export async function updateRolePermissionsApi(role: string, permissions: string[]) {
  const data = await gql<{ updateRolePermissions: any[] }>(
    `mutation UpdateRolePermissions($role: UserRole!, $input: UpdateRolePermissionsInput!) { updateRolePermissions(role: $role, input: $input) { id role permission } }`,
    { role, input: { permissions } },
  );
  return data.updateRolePermissions;
}

export async function getMyNotificationsApi() {
  const data = await gql<{ notificationsByUser: any[] }>(
    `query MyNotifications { notificationsByUser { id title message type is_read created_at } }`,
  );
  return data.notificationsByUser;
}

export async function markNotificationsReadApi(ids: (string | number)[]) {
  const data = await gql<{ markNotificationsAsRead: { message: string; ids: number[] } }>(
    `mutation MarkRead($ids: [ID!]!) { markNotificationsAsRead(ids: $ids) { message ids } }`,
    { ids },
  );
  return data.markNotificationsAsRead;
}
