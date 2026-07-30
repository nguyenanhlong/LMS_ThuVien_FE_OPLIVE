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

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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

// Giỏ hàng lưu ở localStorage nên nếu mở nhiều tab, mỗi tab chỉ có state riêng trong bộ nhớ.
// Để tránh tình huống tab A thêm 3 cuốn, tab B thêm 4 cuốn rồi tab B ghi đè làm mất 3 cuốn của tab A:
// mọi hàm thay đổi (addItem/removeItem/updateItem/clearSelected) đều đọc lại localStorage MỚI NHẤT
// ngay trước khi áp dụng thay đổi, thay vì chỉ dựa vào state React đang có (có thể đã cũ).
// Đồng thời lắng nghe sự kiện 'storage' để tab đang mở cũng cập nhật hiển thị khi tab khác đổi giỏ hàng.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readStorage());

    function handleStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setItems(readStorage());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addItem = useCallback((book: any) => {
    const current = readStorage();
    if (current.some((i) => i.bookId === book.id)) { setItems(current); return; }
    const maxBorrowDays = book.max_borrow_days || 14;
    const next: CartItem[] = [...current, {
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
    writeStorage(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((bookId: string) => {
    const next = readStorage().filter((i) => i.bookId !== bookId);
    writeStorage(next);
    setItems(next);
  }, []);

  const updateItem = useCallback((bookId: string, patch: Partial<CartItem>) => {
    const next = readStorage().map((i) => (i.bookId === bookId ? { ...i, ...patch } : i));
    writeStorage(next);
    setItems(next);
  }, []);

  const clearSelected = useCallback(() => {
    const next = readStorage().filter((i) => !i.selected);
    writeStorage(next);
    setItems(next);
  }, []);

  const isInCart = useCallback((bookId: string) => items.some((i) => i.bookId === bookId), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearSelected, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}
