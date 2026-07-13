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
    const res = await fetch(`${API_BASE}/auths/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const json = await res.json();
    const token = json.data?.access_token;
    if (token) setTokens(token);
    return token;
  } catch { clearTokens(); return null; }
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const json = await res.json();
  if (!res.ok) {
    const msg = json.message || `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return json.data as T;
}

export async function loginApi(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auths/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.message || 'Login failed';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  const tokens = json.data;
  if (tokens?.access_token) {
    setTokens(tokens.access_token, tokens.refresh_token);
  }
  return tokens;
}

export async function registerApi(data: { username: string; full_name: string; email: string; password: string; role: string }) {
  const res = await fetch(`${API_BASE}/auths/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.message || 'Register failed';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return json.data;
}

export { getToken, clearTokens };

export async function getLoansApi(params?: { status?: string; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.append('status', params.status);
  qs.append('pageSize', String(params?.pageSize ?? 100));
  return api<any>(`/loans?${qs.toString()}`);
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

export async function cancelLoanApi(id: string | number, cancelled_reason: string) {
  return api(`/loans/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelled_reason }),
  });
}

export async function getBooksApi(params?: { keyword?: string; sub_category_id?: number; author?: string; is_active?: boolean; pageSize?: number }) {
  const qs = new URLSearchParams();
  if (params?.keyword) qs.append('keyword', params.keyword);
  if (params?.sub_category_id) qs.append('sub_category_id', String(params.sub_category_id));
  if (params?.author) qs.append('author', params.author);
  if (params?.is_active !== undefined) qs.append('is_active', String(params.is_active));
  qs.append('pageSize', String(params?.pageSize ?? 100));
  return api<any>(`/books?${qs.toString()}`);
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

export async function getCategoriesApi() {
  return api<any[]>('/categories');
}

export async function getSubCategoriesApi(category_id?: number) {
  const qs = category_id ? `?category_id=${category_id}` : '';
  return api<any[]>(`/sub-categories${qs}`);
}