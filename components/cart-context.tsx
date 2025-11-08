'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (item: CartItem) => {
    setItems((prev) => (prev.find((i) => i.id === item.id) ? prev : [...prev, item]));
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.length;
  const total = useMemo(() => items.reduce((s, i) => s + (i.price || 0), 0), [items]);

  const value = useMemo(() => ({ items, add, remove, clear, count, total }), [items, count, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
