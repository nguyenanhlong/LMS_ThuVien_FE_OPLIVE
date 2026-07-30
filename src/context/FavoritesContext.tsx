'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getMyFavoriteBooksApi, addMyFavoriteBookApi, removeMyFavoriteBookApi } from '@/lib/api';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (bookId: string) => boolean;
  toggleFavorite: (bookId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({} as FavoritesContextType);

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setFavoriteIds(new Set()); return; }
    setLoading(true);
    try {
      const data = await getMyFavoriteBooksApi({ pageSize: 100 });
      setFavoriteIds(new Set((data.items || []).map((b: any) => String(b.id))));
    } catch {
      setFavoriteIds(new Set());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isFavorite = useCallback((bookId: string) => favoriteIds.has(bookId), [favoriteIds]);

  const toggleFavorite = useCallback(async (bookId: string) => {
    const wasFavorite = favoriteIds.has(bookId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(bookId); else next.add(bookId);
      return next;
    });
    try {
      if (wasFavorite) await removeMyFavoriteBookApi(bookId);
      else await addMyFavoriteBookApi(bookId);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(bookId); else next.delete(bookId);
        return next;
      });
    }
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loading, isFavorite, toggleFavorite, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}
