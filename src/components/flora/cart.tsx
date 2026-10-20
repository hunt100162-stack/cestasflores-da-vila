import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartLine } from "@/lib/order";
import type { Product } from "@/data/catalog";

type Ctx = {
  lines: CartLine[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "flora-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setLines(JSON.parse(s)); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines, loaded]);

  const add = (p: Product) =>
    setLines((ls) => {
      const f = ls.find((l) => l.id === p.id);
      if (f) return ls.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { id: p.id, name: p.name, price: p.price, qty: 1, priceFrom: p.priceFrom }];
    });
  const setQty = (id: string, qty: number) =>
    setLines((ls) => (qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty } : l))));
  const remove = (id: string) => setLines((ls) => ls.filter((l) => l.id !== id));

  return (
    <CartCtx.Provider
      value={{ lines, open, setOpen, add, setQty, remove, clear: () => setLines([]), count: lines.reduce((s, l) => s + l.qty, 0) }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
