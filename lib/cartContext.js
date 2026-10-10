'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CART_KEY = 'cart';

// Keeps only well-formed rows and drops anything without an id/price so a
// corrupted or hand-edited localStorage entry can never crash a page.
const sanitize = (value) =>
  Array.isArray(value)
    ? value
        .filter(
          (i) =>
            i &&
            typeof i === 'object' &&
            typeof i.product === 'string' &&
            i.product &&
            Number.isFinite(Number(i.price))
        )
        .map((i) => ({
          product: i.product,
          name: typeof i.name === 'string' ? i.name : '',
          slug: typeof i.slug === 'string' ? i.slug : '',
          price: Number(i.price),
          image: typeof i.image === 'string' ? i.image : '',
          quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
        }))
    : [];

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  // `hydrated` gates both persistence and the "cart is empty" screens, so the
  // first paint never flashes an empty cart before localStorage has been read.
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (localStorage is browser-only, so never during SSR).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setCart(sanitize(JSON.parse(stored)));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist changes, but never before the initial load finished — otherwise the
  // empty initial state would overwrite the stored cart. An empty cart removes
  // the key outright so a signed-out device has nothing left behind.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (cart.length === 0) localStorage.removeItem(CART_KEY);
      else localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, hydrated]);

  // Signing out wipes every trace of the previous session from this device.
  // 'auth:logout'   = session died on its own (401 / expired token)
  // 'auth:signedout' = the visitor pressed Logout
  useEffect(() => {
    const wipe = () => {
      setCart([]);
      try {
        localStorage.removeItem(CART_KEY);
      } catch {}
    };
    window.addEventListener('auth:logout', wipe);
    window.addEventListener('auth:signedout', wipe);
    return () => {
      window.removeEventListener('auth:logout', wipe);
      window.removeEventListener('auth:signedout', wipe);
    };
  }, []);

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const amount = Math.max(1, Math.floor(Number(qty) || 1));
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + amount } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price) || 0,
          image: product.images?.[0] || '',
          quantity: amount,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setCart((prev) => {
      const next = Math.floor(Number(qty) || 0);
      if (next <= 0) return prev.filter((i) => i.product !== productId);
      return prev.map((i) => (i.product === productId ? { ...i, quantity: next } : i));
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((i) => i.product !== productId));
    toast.success('Removed from cart');
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal < 300 ? 100 : 0) : 0;
  const total = subtotal + shipping;
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        hydrated,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal,
        shipping,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);