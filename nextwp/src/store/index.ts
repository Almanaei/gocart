
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WooCommerceProduct, WooCommerceCart, WooCommerceCartItem, WooCommerceCustomer } from '@/types/wordpress';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

interface AppState {
  // User State
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart State
  cart: WooCommerceCart | null;
  cartItems: WooCommerceCartItem[];
  isLoadingCart: boolean;
  setCart: (cart: WooCommerceCart | null) => void;
  setCartItems: (items: WooCommerceCartItem[]) => void;
  setIsLoadingCart: (loading: boolean) => void;
  addToCart: (product: WooCommerceProduct, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartKey: string) => Promise<boolean>;
  updateCartItemQuantity: (cartKey: string, quantity: number) => Promise<boolean>;
  clearCart: () => void;

  // Wishlist State
  wishlist: number[]; // Array of product IDs
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Theme State
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User State
      user: null,
      setUser: (user) => set({ user }),

      // Cart State
      cart: null,
      cartItems: [],
      isLoadingCart: false,
      setCart: (cart) => set({ cart, cartItems: cart?.items || [] }),
      setCartItems: (items) => set({ cartItems: items }),
      setIsLoadingCart: (loading) => set({ isLoadingCart: loading }),

      addToCart: async (product, quantity = 1) => {
        const { setIsLoadingCart, setCart } = get();
        setIsLoadingCart(true);

        try {
          const { wcService } = await import('@/lib/wordpress-api');
          const result = await wcService.addToCart(product.id, quantity);

          if (result) {
            setCart(result);
            setIsLoadingCart(false);
            return true;
          }

          setIsLoadingCart(false);
          return false;
        } catch (error) {
          console.error('Error adding to cart:', error);
          setIsLoadingCart(false);
          return false;
        }
      },

      removeFromCart: async (cartKey) => {
        const { setIsLoadingCart, setCart } = get();
        setIsLoadingCart(true);

        try {
          const { wcService } = await import('@/lib/wordpress-api');
          const result = await wcService.removeFromCart(cartKey);

          if (result) {
            setCart(result);
            setIsLoadingCart(false);
            return true;
          }

          setIsLoadingCart(false);
          return false;
        } catch (error) {
          console.error('Error removing from cart:', error);
          setIsLoadingCart(false);
          return false;
        }
      },

      updateCartItemQuantity: async (cartKey, quantity) => {
        const { setIsLoadingCart, setCart } = get();
        setIsLoadingCart(true);

        try {
          const { wcService } = await import('@/lib/wordpress-api');
          const result = await wcService.updateCartItem(cartKey, quantity);

          if (result) {
            setCart(result);
            setIsLoadingCart(false);
            return true;
          }

          setIsLoadingCart(false);
          return false;
        } catch (error) {
          console.error('Error updating cart item:', error);
          setIsLoadingCart(false);
          return false;
        }
      },

      clearCart: () => {
        set({ cart: null, cartItems: [] });
      },

      // Wishlist State
      wishlist: [],
      addToWishlist: (productId) => {
        const { wishlist } = get();
        if (!wishlist.includes(productId)) {
          set({ wishlist: [...wishlist, productId] });
        }
      },
      removeFromWishlist: (productId) => {
        const { wishlist } = get();
        set({ wishlist: wishlist.filter(id => id !== productId) });
      },
      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.includes(productId);
      },

      // UI State
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme State
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        wishlist: state.wishlist,
        theme: state.theme,
      }),
    }
  )
);
