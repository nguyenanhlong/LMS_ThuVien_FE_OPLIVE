'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

const GUEST_STORAGE_KEY = 'cart_items_guest';

// Giỏ hàng gắn theo từng tài khoản (cart_items_<userId>) — khách chưa đăng nhập
// dùng chung key cart_items_guest. Tránh bug: tài khoản A để giỏ hàng, đăng xuất,
// tài khoản B đăng nhập trên cùng trình duyệt vẫn thấy giỏ của A cho tới khi F5.
function storageKeyFor(userId?: number | null) {
  return userId ? `cart_items_${userId}` : GUEST_STORAGE_KEY;
}

function readStorage(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(key: string, items: CartItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
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

// Đồng bộ đa tab: mọi hàm thay đổi (addItem/removeItem/updateItem/clearSelected) đều đọc lại
// localStorage MỚI NHẤT ngay trước khi áp dụng thay đổi, thay vì chỉ dựa vào state React đang có
// (có thể đã cũ) — tránh tab A thêm 3 cuốn, tab B thêm 4 cuốn rồi tab B ghi đè làm mất 3 cuốn của tab A.
// Đồng thời lắng nghe sự kiện 'storage' để tab đang mở cũng cập nhật khi tab khác đổi giỏ hàng.
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const keyRef = useRef(GUEST_STORAGE_KEY);
  const prevUserIdRef = useRef<number | null>(null);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    const key = storageKeyFor(user?.id);
    const isFirstRun = isFirstRunRef.current;
    isFirstRunRef.current = false;

    // Khách vừa đăng nhập TRONG phiên này (guest -> user thật, không tính lần tải trang
    // đầu tiên khi token cũ đã tự đăng nhập sẵn): gộp giỏ hàng khách đã thêm vào giỏ
    // của tài khoản vừa đăng nhập, để không mất sách đã chọn lúc chưa đăng nhập.
    if (user && !isFirstRun && prevUserIdRef.current === null) {
      const guestItems = readStorage(GUEST_STORAGE_KEY);
      if (guestItems.length) {
        const own = readStorage(key);
        const merged = [...own];
        for (const g of guestItems) {
          if (!merged.some((i) => i.bookId === g.bookId)) merged.push(g);
        }
        writeStorage(key, merged);
        localStorage.removeItem(GUEST_STORAGE_KEY);
        keyRef.current = key;
        prevUserIdRef.current = user.id;
        setItems(merged);
        return;
      }
    }

    keyRef.current = key;
    prevUserIdRef.current = user?.id ?? null;
    setItems(readStorage(key));
  }, [user?.id]);

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== keyRef.current) return;
      setItems(readStorage(keyRef.current));
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addItem = useCallback((book: any) => {
    const key = keyRef.current;
    const current = readStorage(key);
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
    writeStorage(key, next);
    setItems(next);
  }, []);

  const removeItem = useCallback((bookId: string) => {
    const key = keyRef.current;
    const next = readStorage(key).filter((i) => i.bookId !== bookId);
    writeStorage(key, next);
    setItems(next);
  }, []);

  const updateItem = useCallback((bookId: string, patch: Partial<CartItem>) => {
    const key = keyRef.current;
    const next = readStorage(key).map((i) => (i.bookId === bookId ? { ...i, ...patch } : i));
    writeStorage(key, next);
    setItems(next);
  }, []);

  const clearSelected = useCallback(() => {
    const key = keyRef.current;
    const next = readStorage(key).filter((i) => !i.selected);
    writeStorage(key, next);
    setItems(next);
  }, []);

  const isInCart = useCallback((bookId: string) => items.some((i) => i.bookId === bookId), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearSelected, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}
