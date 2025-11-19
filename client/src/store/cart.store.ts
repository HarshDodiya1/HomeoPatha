import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/lib/services/product.service';
import { Cart, AddToCartRequest } from '@/types/product';
import { toast } from 'sonner';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isCartOpen: false,
      error: null,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.getCart();
          set({ cart: response.data.cart, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addToCart: async (data: AddToCartRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.addToCart(data);
          set({ cart: response.data.cart, isLoading: false, isCartOpen: true });
          toast.success('Item added to cart');
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error(error.response?.data?.message || 'Failed to add item to cart');
          throw error;
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.updateCartItem(productId, { quantity });
          set({ cart: response.data.cart, isLoading: false });
          toast.success('Cart updated');
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error('Failed to update cart');
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.removeFromCart(productId);
          set({ cart: response.data.cart, isLoading: false });
          toast.success('Item removed from cart');
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error('Failed to remove item');
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await cartService.clearCart();
          set({ cart: response.data.cart, isLoading: false });
          toast.success('Cart cleared');
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          toast.error('Failed to clear cart');
        }
      },

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      getItemCount: () => {
        const cart = get().cart;
        return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
