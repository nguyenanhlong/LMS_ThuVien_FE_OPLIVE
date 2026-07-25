'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'auto';
type Theme = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function useTheme() {
  return useContext(ThemeContext);
}

// 7h-17h → sáng, 18h-6h → tối
function getTimeBasedTheme(): Theme {
  const hour = new Date().getHours();
  return (hour >= 7 && hour < 18) ? 'light' : 'dark';
}

function resolve(mode: ThemeMode): Theme {
  return mode === 'auto' ? getTimeBasedTheme() : mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState<Theme>('dark');

  // Đọc preference từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
    const m = saved || 'dark';
    setMode(m);
    setTheme(resolve(m));
  }, []);

  // Áp dụng lên <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto mode: kiểm tra mỗi phút
  useEffect(() => {
    if (mode !== 'auto') return;
    const check = () => setTheme(getTimeBasedTheme());
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [mode]);

  // Xoay vòng: dark → light → auto → dark
  const toggleTheme = () => {
    setMode(prev => {
      const next: Record<ThemeMode, ThemeMode> = { dark: 'light', light: 'auto', auto: 'dark' };
      const n = next[prev];
      setTheme(resolve(n));
      localStorage.setItem('theme-mode', n);
      return n;
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
