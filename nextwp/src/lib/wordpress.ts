// WordPress REST API Base Configuration
export class WordPressAPI {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private authHeader: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com';
    this.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    this.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
    
    // Create basic auth header for WooCommerce REST API
    this.authHeader = `Basic ${Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')}`;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
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
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('WordPress API Request Failed:', error);
      throw error;
    }
  }

  // WordPress REST API endpoints
  async getPosts(params: {
    page?: number;
    per_page?: number;
    categories?: number[];
    tags?: number[];
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const endpoint = `/wp-json/wp/v2/posts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getPages(params: {
    page?: number;
    per_page?: number;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/wp-json/wp/v2/pages${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getCategories(params: {
    page?: number;
    per_page?: number;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/wp-json/wp/v2/categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getMenu(location: string) {
    const endpoint = `/wp-json/menus/v1/menus/${location}`;
    return this.request(endpoint);
  }

  async getSiteInfo() {
    const endpoint = '/wp-json';
    return this.request(endpoint);
  }
}

// WooCommerce REST API
export class WooCommerceAPI extends WordPressAPI {
  // Products
  async getProducts(params: {
    page?: number;
    per_page?: number;
    category?: number;
    tag?: number;
    search?: string;
    orderby?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
    order?: 'asc' | 'desc';
    status?: 'any' | 'publish' | 'pending' | 'private';
    featured?: boolean;
    on_sale?: boolean;
    min_price?: number;
    max_price?: number;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
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

  async getProductVariations(productId: number) {
    const endpoint = `/wp-json/wc/v3/products/${productId}/variations`;
    return this.request(endpoint);
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

  // Product Tags
  async getProductTags(params: {
    page?: number;
    per_page?: number;
    search?: string;
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

    const endpoint = `/wp-json/wc/v3/products/tags${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Cart Operations (using WooCommerce Cart API)
  async getCart() {
    const endpoint = '/wp-json/wc/store/cart';
    return this.request(endpoint);
  }

  async addToCart(productId: number, quantity: number = 1, variationId?: number) {
    const endpoint = '/wp-json/wc/store/cart/add-item';
    const body = {
      id: productId,
      quantity,
      ...(variationId && { variation_id: variationId })
    };
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateCartItem(itemKey: string, quantity: number) {
    const endpoint = '/wp-json/wc/store/cart/update-item';
    const body = {
      key: itemKey,
      quantity,
    };
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async removeCartItem(itemKey: string) {
    const endpoint = '/wp-json/wc/store/cart/remove-item';
    const body = {
      key: itemKey,
    };
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async clearCart() {
    const endpoint = '/wp-json/wc/store/cart/clear';
    return this.request(endpoint, {
      method: 'POST',
    });
  }

  // Checkout
  async getCheckout() {
    const endpoint = '/wp-json/wc/store/checkout';
    return this.request(endpoint);
  }

  async processCheckout(orderData: any) {
    const endpoint = '/wp-json/wc/store/checkout';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
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
    const endpoint = '/wp-json/wc/v3/customers';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
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

  async getOrder(id: number) {
    const endpoint = `/wp-json/wc/v3/orders/${id}`;
    return this.request(endpoint);
  }

  // Reviews
  async getProductReviews(productId: number) {
    const endpoint = `/wp-json/wc/v3/products/${productId}/reviews`;
    return this.request(endpoint);
  }

  async createReview(reviewData: {
    product_id: number;
    review: string;
    reviewer: string;
    reviewer_email: string;
    rating: number;
  }) {
    const endpoint = '/wp-json/wc/v3/products/reviews';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }
}

// Export singleton instances
export const wordpressAPI = new WordPressAPI();
export const woocommerceAPI = new WooCommerceAPI();