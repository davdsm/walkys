import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  size: string | null;
  quantity: number;
  imageUrl?: string;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: string | null) => void;
  updateQuantity: (productId: string, size: string | null, delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameLineItem(a: CartItem, b: Omit<CartItem, "quantity">) {
  return a.productId === b.productId && a.size === b.size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLineItem(i, item));
      if (existing) {
        return prev.map((i) =>
          sameLineItem(i, item)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string | null, delta: number) => {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        );
        return next.filter((i) => i.quantity > 0);
      });
    },
    []
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      openCart,
      closeCart,
      clearCart,
      itemCount,
    }),
    [
      items,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      openCart,
      closeCart,
      clearCart,
      itemCount,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
