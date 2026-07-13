const API_BASE = '';

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
  const res = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            username
            email
            full_name
            is_active
          }
        }
      `,
      variables: {
        input: {
          username: data.username,
          full_name: data.full_name,
          email: data.email,
          password: data.password
        }
      }
    }),
  });
  const json = await res.json();
  if (json.errors) {
    const msg = json.errors[0].message || 'Register failed';
    throw new Error(msg);
  }
  return json.data?.register;
}

export { getToken, clearTokens };
