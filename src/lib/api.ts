const API_BASE = 'http://localhost:3000';

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
      body: JSON.stringify({ refreshToken: refresh }),
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
