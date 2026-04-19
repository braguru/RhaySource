import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from './NotificationContext';

const HomeLivingCartContext = createContext();

export const useHomeLivingCart = () => {
  const context = useContext(HomeLivingCartContext);
  if (!context) throw new Error('useHomeLivingCart must be used within a HomeLivingCartProvider');
  return context;
};

export const HomeLivingCartProvider = ({ children }) => {
  const { addNotification } = useNotification();
  const [homeCart, setHomeCart] = useState(() => {
    const saved = localStorage.getItem('rhaysource_home_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHomeCartOpen, setIsHomeCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('rhaysource_home_cart', JSON.stringify(homeCart));
  }, [homeCart]);

  const openHomeCart   = useCallback(() => setIsHomeCartOpen(true), []);
  const closeHomeCart  = useCallback(() => setIsHomeCartOpen(false), []);
  const toggleHomeCart = useCallback(() => setIsHomeCartOpen(p => !p), []);

  const addToHomeCart = useCallback((product, quantity = 1) => {
    setHomeCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });

    addNotification({
      title: 'SANCTUARY',
      message: `${product.name} added to your Home`,
      image: product.image_url || product.images?.primary,
      type: 'home',
      onCloseCart: openHomeCart
    });
  }, [addNotification, openHomeCart]);

  const removeFromHomeCart = useCallback((id) => {
    setHomeCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateHomeQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) { removeFromHomeCart(id); return; }
    setHomeCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  }, [removeFromHomeCart]);

  const clearHomeCart = useCallback(() => setHomeCart([]), []);

  const homeCartTotal = homeCart.reduce((t, i) => t + i.price * i.quantity, 0);
  const homeCartCount = homeCart.reduce((t, i) => t + i.quantity, 0);

  return (
    <HomeLivingCartContext.Provider value={{
      homeCart, addToHomeCart, removeFromHomeCart, updateHomeQuantity, clearHomeCart,
      homeCartTotal, homeCartCount,
      isHomeCartOpen, openHomeCart, closeHomeCart, toggleHomeCart,
    }}>
      {children}
    </HomeLivingCartContext.Provider>
  );
};
