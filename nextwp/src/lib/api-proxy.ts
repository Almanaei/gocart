import axios from 'axios';

// Server-side WordPress API proxy
class WordPressAPIProxy {
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private authHeader: string;

  constructor() {
    // These are server-side only, not exposed to client
    this.baseURL = process.env.WORDPRESS_URL || 'https://your-wordpress-site.com';
    this.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    this.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
    
    // Create basic auth header for WooCommerce REST API
    this.authHeader = `Basic ${Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')}`;
  }

  // Generic API request method with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.consumerKey && this.consumerSecret && {
          'Authorization': this.authHeader
        }),
        ...options.headers,
      },
      ...options,
    };

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress API Request Failed:', error);
      throw error;
    }
  }

  // Products API
  async getProducts(params: {
    page?: number;
    per_page?: number;
    category?: number;
    search?: string;
    featured?: boolean;
    on_sale?: boolean;
    orderby?: string;
    order?: 'asc' | 'desc';
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'boolean') {
          searchParams.append(key, value ? 'true' : 'false');
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const endpoint = `/wp-json/wc/v3/products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getProduct(id: number) {
    const endpoint = `/wp-json/wc/v3/products/${id}`;
    return this.request(endpoint);
  }

  async getProductBySlug(slug: string) {
    try {
      const endpoint = `/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}`;
      const products = await this.request(endpoint);
      return Array.isArray(products) && products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`Error fetching product by slug (${slug}):`, error);
      return null;
    }
  }

  // Product Categories
  async getProductCategories(params: {
    page?: number;
    per_page?: number;
    search?: string;
    parent?: number;
    hide_empty?: boolean;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'boolean') {
          searchParams.append(key, value ? 'true' : 'false');
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const endpoint = `/wp-json/wc/v3/products/categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Cart Operations
  async getCart() {
    try {
      const endpoint = '/wp-json/wc/store/cart';
      return this.request(endpoint);
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }

  async addToCart(productId: number, quantity: number = 1) {
    try {
      const endpoint = '/wp-json/wc/store/cart/add-item';
      const body = {
        id: productId,
        quantity
      };
      
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  }

  async updateCartItem(cartKey: string, quantity: number) {
    try {
      const endpoint = '/wp-json/wc/store/cart/update-item';
      const body = {
        key: cartKey,
        quantity,
      };
      
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  }

  async removeFromCart(cartKey: string) {
    try {
      const endpoint = '/wp-json/wc/store/cart/remove-item';
      const body = {
        key: cartKey
      };
      
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return null;
    }
  }

  // Orders
  async getOrders(params: {
    customer_id?: number;
    page?: number;
    per_page?: number;
    status?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/wp-json/wc/v3/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createOrder(orderData: any) {
    try {
      const endpoint = '/wp-json/wc/v3/orders';
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Customers
  async getCustomer(id: number) {
    const endpoint = `/wp-json/wc/v3/customers/${id}`;
    return this.request(endpoint);
  }

  async createCustomer(customerData: {
    email: string;
    first_name: string;
    last_name: string;
    username?: string;
    password?: string;
    billing?: any;
    shipping?: any;
  }) {
    try {
      const endpoint = '/wp-json/wc/v3/customers';
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // System Status
  async getSystemStatus() {
    const endpoint = '/wp-json/wc/v3/system_status';
    return this.request(endpoint);
  }

  // Search
  async searchProducts(query: string, params?: any) {
    const searchParams = new URLSearchParams();
    searchParams.append('search', query);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/wp-json/wc/v3/products?${searchParams.toString()}`;
    return this.request(endpoint);
  }
}

// Export singleton instance
export const wordpressAPIProxy = new WordPressAPIProxy();