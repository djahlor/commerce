'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types for our cart state
export type CartItem = {
  id: string;
  productId: string;
  handle: string;
  title: string;
  variantId?: string;
  variantTitle?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  url?: string; // URL for analysis (e-commerce site URL)
  image?: {
    url: string;
    altText: string;
    width?: number;
    height?: number;
  };
  options?: {
    name: string;
    value: string;
  }[];
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  subtotal: {
    amount: string;
    currencyCode: string;
  };
};

type CartActions = {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItem: (itemId: string) => CartItem | undefined;
};

// Calculate total based on cart items
const calculateCartTotals = (items: CartItem[]): Pick<CartState, 'totalItems' | 'subtotal'> => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotalAmount = items.reduce((sum, item) => {
    return sum + parseFloat(item.price.amount) * item.quantity;
  }, 0);
  
  // Default to USD if no items, otherwise use the currency of the first item
  const currencyCode = items.length > 0 && items[0]?.price?.currencyCode ? items[0].price.currencyCode : 'USD';
  
  return {
    totalItems,
    subtotal: {
      amount: subtotalAmount.toFixed(2),
      currencyCode
    }
  };
};

// Create the cart store with persistence
export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      subtotal: {
        amount: '0.00',
        currencyCode: 'USD'
      },
      
      // Actions
      addItem: (itemToAdd) => {
        set((state) => {
          // Check if the item already exists
          const existingItemIndex = state.items.findIndex(
            item => item.id === itemToAdd.id || 
            (item.productId === itemToAdd.productId && 
              item.variantId === itemToAdd.variantId)
          );
          
          // Use provided quantity or default to 1
          const quantity = itemToAdd.quantity ?? 1;
          
          let updatedItems: CartItem[];
          
          if (existingItemIndex > -1) {
            // Update existing item
            updatedItems = [...state.items];
            const existingItem = updatedItems[existingItemIndex];
            if (existingItem) {
              updatedItems[existingItemIndex] = {
                ...existingItem,
                quantity: existingItem.quantity + quantity
              };
            }
          } else {
            // Add new item
            updatedItems = [
              ...state.items,
              { ...itemToAdd, quantity }
            ];
          }
          
          return {
            ...state,
            items: updatedItems,
            ...calculateCartTotals(updatedItems)
          };
        });
      },
      
      updateItemQuantity: (itemId, quantity) => {
        set((state) => {
          const updatedItems = state.items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          ).filter(item => item.quantity > 0);
          
          return {
            ...state,
            items: updatedItems,
            ...calculateCartTotals(updatedItems)
          };
        });
      },
      
      removeItem: (itemId) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.id !== itemId);
          
          return {
            ...state,
            items: updatedItems,
            ...calculateCartTotals(updatedItems)
          };
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: {
            amount: '0.00',
            currencyCode: 'USD'
          }
        });
      },
      
      getItem: (itemId) => {
        return get().items.find(item => item.id === itemId);
      }
    }),
    {
      name: 'commerce-cart', // localStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

// Selector hooks for easy access to cart data
export const useCartItems = () => useCartStore(state => state.items);
export const useCartTotalItems = () => useCartStore(state => state.totalItems);
export const useCartSubtotal = () => useCartStore(state => state.subtotal);
export const useCartActions = () => {
  const { addItem, updateItemQuantity, removeItem, clearCart } = useCartStore();
  return { addItem, updateItemQuantity, removeItem, clearCart };
}; 