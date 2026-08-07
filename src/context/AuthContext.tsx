'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loginApi, registerApi, clearTokens, getToken, getMyProfileApi, fetchAndCachePermissions, clearCachedPermSignature } from '@/lib/api';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar?: string;
  is_email_verified?: boolean;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isManager: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await getMyProfileApi();
      setUser({
        id: Number(me.id),
        email: me.email,
        role: me.role,
        username: me.username,
        full_name: me.full_name,
        avatar: me.avatar,
        is_email_verified: me.is_email_verified,
      });
    } catch {
      // JWT hết hạn/không hợp lệ — gql() sẽ tự clearTokens() nếu refresh cũng thất bại
    }
  }, []);
  //neu getToken co gia tri decode payload ngay de setUser() tam thoi, 
  //refreshProfile() chay nen de dong bo du lieu chuan tu server, cuoi cung setLoading(false) trong finally
  //neu decode loi clearTokens() va coi nhu chua dang nhap
  useEffect(() => {
    if (getToken()) {
      try {
        const payload = JSON.parse(atob(getToken()!.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          username: payload.username || '',
          full_name: payload.full_name || payload.email,
          is_email_verified: payload.is_email_verified,
        });
        refreshProfile().finally(() => setLoading(false));
        return;
      } catch {
        clearTokens();
      }
    }
    setLoading(false);
  }, [refreshProfile]);

  //LoginAPI
  const login = useCallback(async (username: string, password: string) => {
    await loginApi(username, password);
    const payload = JSON.parse(atob(getToken()!.split('.')[1]));
    const role = payload.role;
    clearCachedPermSignature(role);
    await fetchAndCachePermissions(role);
    setUser({
      id: payload.sub,
      email: payload.email,
      role,
      username: payload.username || '',
      full_name: payload.full_name || payload.email,
      is_email_verified: payload.is_email_verified,
    });
    await refreshProfile();
  }, [refreshProfile]);

  //RegisterAPI
  const register = useCallback(async (data: { username: string; full_name: string; email: string; password: string }) => {
    await registerApi(data);
  }, []);

  //LogoutAPI chi lam 2 viec la clearToken() (xoa access token va refresh token trong localStorage) va setUser(null)
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isManager = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isManager, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
