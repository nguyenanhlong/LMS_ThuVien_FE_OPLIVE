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

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($input: RefreshInput!) {
            refreshToken(input: $input) {
              access_token
              refresh_token
            }
          }
        `,
        variables: {
          input: {
            refresh_token: refresh
          }
        }
      })
    });
    if (!res.ok) { clearTokens(); return null; }
    const json = await res.json();
    if (json.errors) { clearTokens(); return null; }
    const token = json.data?.refreshToken?.access_token;
    const newRefresh = json.data?.refreshToken?.refresh_token;
    if (token) setTokens(token, newRefresh);
    return token;
  } catch { clearTokens(); return null; }
}

export async function graphqlQuery<T = any>(query: string, variables?: any, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
    headers,
    ...options,
  });

  let json = await res.json();

  const isUnauthorized = json.errors?.some((err: any) => err.message === 'Unauthorized');

  if ((res.status === 401 || isUnauthorized) && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}/graphql`, {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers,
        ...options,
      });
      json = await res.json();
    }
  }

  if (json.errors) {
    const msg = json.errors[0].message || 'GraphQL Error';
    throw new Error(msg);
  }

  return json.data as T;
}

export async function loginApi(username: string, password: string) {
  const res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            access_token
            refresh_token
          }
        }
      `,
      variables: {
        input: { username, password }
      }
    }),
  });
  const json = await res.json();
  if (json.errors) {
    const msg = json.errors[0].message || 'Login failed';
    throw new Error(msg);
  }
  const tokens = json.data?.login;
  if (tokens?.access_token) {
    setTokens(tokens.access_token, tokens.refresh_token);
  }
  return tokens;
}

export async function registerApi(data: { username: string; full_name: string; email: string; password: string }) {
  return graphqlQuery(`
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        id
        username
        email
        full_name
        is_active
      }
    }
  `, {
    input: {
      username: data.username,
      full_name: data.full_name,
      email: data.email,
      password: data.password
    }
  }).then(r => r.register);
}

export { getToken, clearTokens };

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

export async function getLoansApi(params?: { status?: string; pageSize?: number; user_id?: number }) {
  return graphqlQuery<any>(
    `query GetLoans($query: GetLoansInput) { loans(query: $query) { items { id loan_date status cancelled_reason total_deposit total_rental_fee total_amount total_fine total_lost_fee total_initial_payment total_deposit_refund total_extra_payment borrower { user_id full_name email } books { loan_detail_id book_id title author image_url quantity borrow_days due_date completed_at status deposit_amount rental_fee fine_amount lost_quantity lost_fee deposit_refund_amount extra_payment_amount returned_histories { id return_date return_quantity lost_quantity late_days fine_amount lost_fee deposit_refund_amount extra_payment_amount note } } } } }`,
    {
      query: {
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.user_id ? { user_id: params.user_id } : {}),
        pageSize: params?.pageSize ?? 100,
      }
    }).then(r => r.loans);
}

export async function getLoanByIdApi(id: string | number) {
  return graphqlQuery<any>(
    `query GetLoan($id: ID!) { loan(id: $id) { id loan_date status cancelled_reason total_deposit total_rental_fee total_amount total_fine total_lost_fee total_initial_payment total_deposit_refund total_extra_payment borrower { user_id full_name email } books { loan_detail_id book_id title author image_url quantity borrow_days due_date completed_at status deposit_amount rental_fee fine_amount lost_quantity lost_fee deposit_refund_amount extra_payment_amount returned_histories { id return_date return_quantity lost_quantity late_days fine_amount lost_fee deposit_refund_amount extra_payment_amount note } } } }`,
    { id: String(id) }
  ).then(r => r.loan);
}

export async function confirmLoanApi(id: string | number) {
  return graphqlQuery(`
    mutation ConfirmLoan($id: ID!) {
      confirmLoan(id: $id)
    }
  `, { id: String(id) });
}

export async function borrowingLoanApi(id: string | number) {
  return graphqlQuery(`
    mutation PayAndBorrow($id: ID!) {
      payAndBorrow(id: $id)
    }
  `, { id: String(id) });
}

export async function returnLoanDetailApi(detailId: string | number, input: { return_quantity: number; lost_quantity?: number; note?: string }) {
  return graphqlQuery(`
    mutation ReturnLoanDetail($detailId: ID!, $input: ReturnDetailInput!) {
      returnLoanDetail(detailId: $detailId, input: $input)
    }
  `, { detailId: String(detailId), input });
}

export async function cancelLoanApi(id: string | number, cancelled_reason: string) {
  return graphqlQuery(`
    mutation CancelLoan($id: ID!, $input: CancelLoanInput!) {
      cancelLoan(id: $id, input: $input)
    }
  `, { id: String(id), input: { cancelled_reason } });
}

export async function getBooksApi(params?: { keyword?: string; sub_category_id?: number; author?: string; is_active?: boolean; pageSize?: number }) {
  return graphqlQuery<any>(
    `query GetBooks($query: GetBooksInput) { books(query: $query) { items { id title isbn author image_url publisher publisher_year description total_quantity borrowed_quantity max_borrow_days deposit_amount fine_per_day replacement_cost fee_per_day fee_per_week fee_per_month is_active sub_category_id sub_category { id name category { id name } } } } }`,
    {
      query: {
        ...(params?.keyword ? { keyword: params.keyword } : {}),
        ...(params?.sub_category_id ? { sub_category_id: params.sub_category_id } : {}),
        ...(params?.author ? { author: params.author } : {}),
        ...(params?.is_active !== undefined ? { is_active: params.is_active } : {}),
        pageSize: params?.pageSize ?? 100,
      }
    }).then(r => r.books);
}

export async function createBookApi(data: any) {
  return graphqlQuery(`
    mutation CreateBook($input: CreateBookInput!) {
      createBook(input: $input) {
        id
      }
    }
  `, { input: data });
}

export async function updateBookApi(id: string | number, data: any) {
  return graphqlQuery(`
    mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
      updateBook(id: $id, input: $input) {
        id
      }
    }
  `, { id: String(id), input: data });
}

export async function deleteBookApi(id: string | number) {
  return graphqlQuery(`
    mutation DeleteBook($id: ID!) {
      deleteBook(id: $id)
    }
  `, { id: String(id) });
}

export async function getCategoriesApi() {
  return graphqlQuery<any>(`
    query GetCategories {
      categories {
        id
        name
        created_at
        updated_at
        sub_categories {
          id
          name
        }
      }
    }
  `).then(r => r.categories);
}

export async function createCategoryApi(name: string) {
  return graphqlQuery(`
    mutation CreateCategory($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        id
        name
      }
    }
  `, { input: { name } });
}

export async function updateCategoryApi(id: string | number, name: string) {
  return graphqlQuery(`
    mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
      updateCategory(id: $id, input: $input) {
        id
        name
      }
    }
  `, { id: String(id), input: { name } });
}

export async function deleteCategoryApi(id: string | number) {
  return graphqlQuery(`
    mutation DeleteCategory($id: ID!) {
      deleteCategory(id: $id)
    }
  `, { id: String(id) });
}

export async function getRolePermissionsApi() {
  return graphqlQuery<any>(`
    query GetRolePermissions {
      rolePermissions {
        id role permission
      }
    }
  `).then(r => r.rolePermissions);
}

export async function getRolePermissionsByRoleApi(role: string) {
  return graphqlQuery<any>(`
    query GetRolePermissionsByRole($role: UserRole!) {
      rolePermissionsByRole(role: $role) {
        id role permission
      }
    }
  `, { role }).then(r => r.rolePermissionsByRole);
}

export async function updateRolePermissionsApi(role: string, permissions: string[]) {
  return graphqlQuery(`
    mutation UpdateRolePermissions($role: UserRole!, $input: UpdateRolePermissionsInput!) {
      updateRolePermissions(role: $role, input: $input) {
        id role permission
      }
    }
  `, { role, input: { permissions } });
}

export async function getSubCategoriesApi(category_id?: number) {
  return graphqlQuery<any>(`
    query GetSubCategories($categoryId: Int) {
      subCategories(categoryId: $categoryId) {
        id
        category_id
        name
      }
    }
  `, { categoryId: category_id }).then(r => r.subCategories);
}

export async function createSubCategoryApi(category_id: number, name: string) {
  return graphqlQuery(`
    mutation CreateSubCategory($input: CreateSubCategoryInput!) {
      createSubCategory(input: $input) {
        id name category_id
      }
    }
  `, { input: { category_id, name } });
}

export async function updateSubCategoryApi(id: string | number, data: { category_id?: number; name?: string }) {
  return graphqlQuery(`
    mutation UpdateSubCategory($id: ID!, $input: UpdateSubCategoryInput!) {
      updateSubCategory(id: $id, input: $input) {
        id name category_id
      }
    }
  `, { id: String(id), input: data });
}

export async function deleteSubCategoryApi(id: string | number) {
  return graphqlQuery(`
    mutation DeleteSubCategory($id: ID!) {
      deleteSubCategory(id: $id)
    }
  `, { id: String(id) });
}
