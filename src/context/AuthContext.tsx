'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loginApi, registerApi, clearTokens, getToken } from '@/lib/api';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

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
        });
      } catch {
        clearTokens();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await loginApi(username, password);
    const payload = JSON.parse(atob(getToken()!.split('.')[1]));
    setUser({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      username: payload.username || '',
      full_name: payload.full_name || payload.email,
    });
  }, []);

  const register = useCallback(async (data: { username: string; full_name: string; email: string; password: string }) => {
    await registerApi(data);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isManager = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}
