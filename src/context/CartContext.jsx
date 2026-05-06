import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve first
    if (user?._id) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user?._id, authLoading, fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data.cart);
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data.cart);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data.cart);
  }, []);

  const clearCart = useCallback(async () => {
    const { data } = await api.delete('/cart');
    setCart(data.cart);
  }, []);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const value = useMemo(
    () => ({ cart, cartLoading, cartCount, fetchCart, addToCart, updateItem, removeItem, clearCart }),
    [cart, cartLoading, cartCount, fetchCart, addToCart, updateItem, removeItem, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);