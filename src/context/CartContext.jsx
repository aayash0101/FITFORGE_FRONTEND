import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch cart whenever user logs in
  useEffect(() => {
    if (user) fetchCart();
    else setCart(null);
  }, [user]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data.cart);
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data.cart);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data.cart);
  };

  const clearCart = async () => {
    const { data } = await api.delete('/cart');
    setCart(data.cart);
  };

  // Total item count for navbar badge
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, cartCount, fetchCart, addToCart, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);