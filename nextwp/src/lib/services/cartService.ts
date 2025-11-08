import { woocommerceAPI } from '../wordpress';
import { 
  WooCommerceCart, 
  WooCommerceCartItem 
} from '../../types/wordpress';

export class CartService {
  private cartCache: WooCommerceCart | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // Get current cart
  async getCart(forceRefresh: boolean = false): Promise<WooCommerceCart> {
    // Check cache
    if (!forceRefresh && this.cartCache && (Date.now() - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cartCache;
    }

    try {
      const cart = await woocommerceAPI.getCart();
      this.cartCache = cart;
      this.lastFetchTime = Date.now();
      return cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(
    productId: number, 
    quantity: number = 1, 
    variationId?: number
  ): Promise<WooCommerceCart> {
    try {
      const cart = await woocommerceAPI.addToCart(productId, quantity, variationId);
      this.cartCache = cart;
      this.lastFetchTime = Date.now();
      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemKey: string, quantity: number): Promise<WooCommerceCart> {
    try {
      const cart = await woocommerceAPI.updateCartItem(itemKey, quantity);
      this.cartCache = cart;
      this.lastFetchTime = Date.now();
      return cart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeCartItem(itemKey: string): Promise<WooCommerceCart> {
    try {
      const cart = await woocommerceAPI.removeCartItem(itemKey);
      this.cartCache = cart;
      this.lastFetchTime = Date.now();
      return cart;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<WooCommerceCart> {
    try {
      const cart = await woocommerceAPI.clearCart();
      this.cartCache = cart;
      this.lastFetchTime = Date.now();
      return cart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart item count
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }

  // Get cart total
  async getCartTotal(): Promise<string> {
    try {
      const cart = await this.getCart();
      return cart.totals.total_price;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return '0.00';
    }
  }

  // Check if cart is empty
  async isCartEmpty(): Promise<boolean> {
    try {
      const cart = await this.getCart();
      return cart.items.length === 0;
    } catch (error) {
      console.error('Error checking if cart is empty:', error);
      return true;
    }
  }

  // Get formatted cart data for UI
  async getFormattedCart() {
    try {
      const cart = await this.getCart();
      
      return {
        items: cart.items.map(item => ({
          id: item.id,
          key: item.key,
          name: item.name,
          price: parseFloat(item.price),
          regularPrice: parseFloat(item.regular_price),
          salePrice: parseFloat(item.sale_price),
          quantity: item.quantity,
          image: item.image.src,
          sku: item.sku,
          total: parseFloat(item.total),
          variations: item.variations,
          stockStatus: item.stock_status,
          inStock: item.stock_status === 'instock'
        })),
        totals: {
          subtotal: parseFloat(cart.totals.total_items),
          shipping: parseFloat(cart.totals.total_shipping),
          tax: parseFloat(cart.totals.total_tax),
          total: parseFloat(cart.totals.total_price),
          currency: cart.totals.currency_code,
          currencySymbol: cart.totals.currency_symbol
        },
        shipping: cart.shipping_rates,
        coupons: cart.coupons,
        paymentMethods: cart.payment_methods,
        needsShipping: cart.needs_shipping,
        needsPayment: cart.needs_payment
      };
    } catch (error) {
      console.error('Error formatting cart data:', error);
      throw error;
    }
  }

  // Calculate shipping estimate
  async calculateShipping(postalCode: string, country: string = 'US') {
    try {
      // This would typically call a shipping API
      // For now, we'll return mock data
      return {
        methods: [
          {
            id: 'flat_rate',
            title: 'Flat Rate',
            cost: 9.99,
            estimatedDays: '3-5 business days'
          },
          {
            id: 'free_shipping',
            title: 'Free Shipping',
            cost: 0,
            estimatedDays: '5-7 business days',
            minimumOrder: 50
          },
          {
            id: 'express',
            title: 'Express Shipping',
            cost: 24.99,
            estimatedDays: '1-2 business days'
          }
        ]
      };
    } catch (error) {
      console.error('Error calculating shipping:', error);
      throw error;
    }
  }

  // Apply coupon code
  async applyCoupon(code: string): Promise<WooCommerceCart> {
    try {
      // This would typically call WooCommerce coupon API
      // For now, we'll simulate by refreshing cart
      return await this.getCart(true);
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  // Remove coupon code
  async removeCoupon(code: string): Promise<WooCommerceCart> {
    try {
      // This would typically call WooCommerce coupon API
      // For now, we'll simulate by refreshing cart
      return await this.getCart(true);
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  }

  // Validate cart before checkout
  async validateCart(): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const cart = await this.getCart();
      const errors: string[] = [];

      // Check if cart is empty
      if (cart.items.length === 0) {
        errors.push('Your cart is empty');
      }

      // Check stock availability
      for (const item of cart.items) {
        if (item.stock_status === 'outofstock') {
          errors.push(`${item.name} is out of stock`);
        }
      }

      // Check if shipping is required but not set
      if (cart.needs_shipping && cart.shipping_rates.length === 0) {
        errors.push('Shipping method is required');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        valid: false,
        errors: ['Unable to validate cart']
      };
    }
  }

  // Clear cache
  clearCache(): void {
    this.cartCache = null;
    this.lastFetchTime = 0;
  }

  // Get cart summary for header
  async getCartSummary() {
    try {
      const itemCount = await this.getCartItemCount();
      const total = await this.getCartTotal();
      
      return {
        itemCount,
        total,
        isEmpty: itemCount === 0
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        itemCount: 0,
        total: '0.00',
        isEmpty: true
      };
    }
  }
}

// Export singleton instance
export const cartService = new CartService();