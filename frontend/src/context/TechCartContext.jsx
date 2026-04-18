import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TechCartContext = createContext();

export const useTechCart = () => {
  const context = useContext(TechCartContext);
  if (!context) {
    throw new Error('useTechCart must be used within a TechCartProvider');
  }
  return context;
};

export const TechCartProvider = ({ children }) => {
  const [techCart, setTechCart] = useState(() => {
    const savedCart = localStorage.getItem('rhaysource_tech_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isTechCartOpen, setIsTechCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('rhaysource_tech_cart', JSON.stringify(techCart));
  }, [techCart]);

  const addToTechCart = useCallback((product) => {
    setTechCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromTechCart = useCallback((productId) => {
    setTechCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateTechQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromTechCart(productId);
      return;
    }
    setTechCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromTechCart]);

  const clearTechCart = useCallback(() => setTechCart([]), []);
  const openTechCart = useCallback(() => setIsTechCartOpen(true), []);
  const closeTechCart = useCallback(() => setIsTechCartOpen(false), []);
  const toggleTechCart = useCallback(() => setIsTechCartOpen(prev => !prev), []);

  const techCartTotal = techCart.reduce((total, item) => total + item.price * item.quantity, 0);
  const techCartCount = techCart.reduce((total, item) => total + item.quantity, 0);

  return (
    <TechCartContext.Provider
      value={{
        techCart,
        addToTechCart,
        removeFromTechCart,
        updateTechQuantity,
        clearTechCart,
        techCartTotal,
        techCartCount,
        isTechCartOpen,
        openTechCart,
        closeTechCart,
        toggleTechCart
      }}
    >
      {children}
    </TechCartContext.Provider>
  );
};
