import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { Product } from '@/types';
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearLocalCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user]);

  async function fetchCart() {
    setLoading(true);
    try {
      const data = await api.get<{ cart_items?: CartItem[] }>('/api/cart');
      const baseItems = data?.cart_items || [];

      // If backend doesn't join product details, hydrate them client-side.
      const hydrated = await Promise.all(
        baseItems.map(async (item) => {
          if (item.product) return item;
          try {
            const product = await api.get<Product>(`/api/products/${item.product_id}`);
            return { ...item, product };
          } catch {
            return item;
          }
        })
      );

      setItems(hydrated);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!user) {
      // For now, only authenticated users can use the cart in this production version
      // In a real app, you'd sync local cart with DB on login
      alert('Please log in to add items to cart');
      throw new Error('Please log in to add items to cart');
    }
    
    try {
      await api.post('/api/cart/items', { product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/api/cart/items/${itemId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.put(`/api/cart/items/${itemId}`, { quantity });
      if (quantity < 1) {
        setItems(prev => prev.filter(i => i.id !== itemId));
      } else {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearLocalCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearLocalCart,
        totalItems,
        totalPrice,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
