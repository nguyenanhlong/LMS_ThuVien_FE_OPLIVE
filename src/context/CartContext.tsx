'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  imageUrl: string;
  category: string;
  availableQuantity: number;
  maxBorrowDays: number;
  depositAmount: number;
  feePerDay: number;
  feePerWeek: number;
  feePerMonth: number;
  quantity: number;
  borrowDays: number;
  selected: boolean;
}

const STORAGE_KEY = 'cart_items';

interface CartContextType {
  items: CartItem[];
  addItem: (book: any) => void;
  removeItem: (bookId: string) => void;
  updateItem: (bookId: string, patch: Partial<CartItem>) => void;
  clearSelected: () => void;
  isInCart: (bookId: string) => boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore corrupt storage */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((book: any) => {
    setItems((prev) => {
      if (prev.some((i) => i.bookId === book.id)) return prev;
      const maxBorrowDays = book.max_borrow_days || 14;
      return [...prev, {
        bookId: book.id,
        title: book.title,
        author: book.author || '',
        imageUrl: book.image_url || '',
        category: book.category || '',
        availableQuantity: book.available_quantity ?? 1,
        maxBorrowDays,
        depositAmount: Number(book.deposit_amount || 0),
        feePerDay: Number(book.fee_per_day || 0),
        feePerWeek: Number(book.fee_per_week || 0),
        feePerMonth: Number(book.fee_per_month || 0),
        quantity: 1,
        borrowDays: Math.min(14, maxBorrowDays),
        selected: true,
      }];
    });
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }, []);

  const updateItem = useCallback((bookId: string, patch: Partial<CartItem>) => {
    setItems((prev) => prev.map((i) => (i.bookId === bookId ? { ...i, ...patch } : i)));
  }, []);

  const clearSelected = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.selected));
  }, []);

  const isInCart = useCallback((bookId: string) => items.some((i) => i.bookId === bookId), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearSelected, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}
