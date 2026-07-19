export const API_BASE = 'http://localhost:3000';

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
  is_active
`;

export async function getBooksApi(params?: { keyword?: string; sub_category_id?: number; author?: string; is_active?: boolean; pageSize?: number }) {
  const data = await gql<{ books: any }>(
    `query Books($query: GetBooksInput) { books(query: $query) { pageNumber pageSize totalItems totalPages items { ${BOOK_FIELDS} } } }`,
    { query: { keyword: params?.keyword, sub_category_id: params?.sub_category_id, author: params?.author, is_active: params?.is_active, pageSize: params?.pageSize ?? 100 } },
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

const LOAN_FIELDS = `
  id loan_date status cancelled_reason
  total_deposit total_rental_fee total_amount total_fine total_lost_fee
  borrower { user_id full_name email }
  books {
    loan_detail_id book_id title author quantity
    returned_quantity lost_quantity remaining_quantity
    borrow_days due_date completed_at status
    deposit_amount rental_fee fine_amount lost_fee deposit_refund_amount extra_payment_amount
  }
`;

export async function getLoansApi(params?: { status?: string; pageSize?: number }) {
  const data = await gql<{ loans: any }>(
    `query Loans($query: GetLoansInput) { loans(query: $query) { pageNumber pageSize totalItems totalPages items { ${LOAN_FIELDS} } } }`,
    { query: { status: params?.status, pageSize: params?.pageSize ?? 100 } },
  );
  return data.loans;
}

export async function createLoanApi(items: { book_id: number; quantity: number; borrow_days: number }[]) {
  const data = await gql<{ createLoan: any }>(
    `mutation CreateLoan($input: CreateLoanInput!) { createLoan(input: $input) { ${LOAN_FIELDS} } }`,
    { input: { items } },
  );
  return data.createLoan;
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
    `query Categories { categories { id name sub_categories { id name } } }`,
  );
  return data.categories;
}

export async function getSubCategoriesApi(categoryId?: number) {
  const data = await gql<{ subCategories: any[] }>(
    `query SubCategories($categoryId: Int) { subCategories(categoryId: $categoryId) { id category_id name } }`,
    { categoryId },
  );
  return data.subCategories;
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

// --- Legacy REST shims ---
// Backend đã bỏ hẳn REST (chỉ còn /graphql). Các hàm dưới đây vẫn gọi REST cũ,
// giữ lại CHỈ để phần Staff/Admin (staff/BooksSection, staff/LoansSection,
// staff/DashboardSection, staff/UsersSection) không vỡ compile — các hàm này
// sẽ lỗi runtime (404) cho tới khi phần đó được migrate sang GraphQL tương tự Member.
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.message || `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return json.data as T;
}

export async function createBookApi(data: any) {
  return api('/books', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBookApi(id: string | number, data: any) {
  return api(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteBookApi(id: string | number) {
  return api(`/books/${id}`, { method: 'DELETE' });
}

export async function getLoanByIdApi(id: string | number) {
  return api<any>(`/loans/${id}`);
}

export async function confirmLoanApi(id: string | number) {
  return api(`/loans/${id}/status-to-confirm`, { method: 'PATCH' });
}

export async function borrowingLoanApi(id: string | number) {
  return api(`/loans/${id}/status-to-borrowing`, { method: 'PATCH' });
}

export async function returnLoanDetailApi(detailId: string | number, lost_quantity = 0) {
  return api(`/loans/details/${detailId}/status-to-returned`, {
    method: 'PATCH',
    body: JSON.stringify({ lost_quantity }),
  });
}
