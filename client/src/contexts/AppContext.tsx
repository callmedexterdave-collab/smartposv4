import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem } from '@shared/schema';

interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  isOffline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.productId === item.productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        const newSubtotal = Math.round(newQuantity * existingItem.price * 100) / 100;
        return prevCart.map(cartItem =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: newQuantity, subtotal: newSubtotal }
            : cartItem
        );
      }
      // Ensure subtotal is properly rounded when adding new item
      const newItem = { ...item, subtotal: Math.round(item.subtotal * 100) / 100 };
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Round quantity to avoid floating point issues
    const roundedQuantity = Math.max(1, Math.floor(quantity));

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: roundedQuantity, subtotal: Math.round(roundedQuantity * item.price * 100) / 100 }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    isOffline,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
