'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  image_path?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'om_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Hydration fix - only load from localStorage after mount
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      // No logging to avoid blocking route - error is handled silently
    }
  }, []);

  // Save to localStorage on items change (only after mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // No logging to avoid blocking route - error is handled silently
    }
  }, [items, mounted]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => (prev.find((i) => i.id === item.id) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);
  
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.length;
  const total = useMemo(() => items.reduce((s, i) => s + (i.price || 0), 0), [items]);

  const value = useMemo(() => ({ items, add, remove, clear, count, total }), [items, add, remove, clear, count, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
