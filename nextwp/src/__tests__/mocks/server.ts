// Mock server implementation without external dependencies

// Mock API handlers for WordPress endpoints
export const handlers = [
  // Products API handler
  {
    method: 'GET',
    url: /https:\/\/test-wordpress\.com\/wp-json\/wc\/v3\/products/,
    response: (req: any) => {
      const url = new URL(req.url);
      const page = Number(url.searchParams.get('page')) || 1;
      const perPage = Number(url.searchParams.get('per_page')) || 10;
      
      // Generate mock products
      const products = Array.from({ length: perPage }, (_, i) => 
        createMockProduct({ id: (page - 1) * perPage + i + 1 })
      );
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      };
    },
  },
  
  // Single Product API handler
  {
    method: 'GET',
    url: /https:\/\/test-wordpress\.com\/wp-json\/wc\/v3\/products\/\d+/,
    response: (req: any) => {
      const url = new URL(req.url);
      const id = url.pathname.split('/').pop();
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createMockProduct({ id: Number(id) })),
      };
    },
  },
  
  // Categories API handler
  {
    method: 'GET',
    url: 'https://test-wordpress.com/wp-json/wc/v3/products/categories',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          id: 1,
          name: 'Electronics',
          slug: 'electronics',
          parent: 0,
          description: 'Electronic products',
          display: 'default',
          image: null,
          menu_order: 0,
          count: 10,
          _links: {},
        },
        {
          id: 2,
          name: 'Clothing',
          slug: 'clothing',
          parent: 0,
          description: 'Clothing items',
          display: 'default',
          image: null,
          menu_order: 0,
          count: 5,
          _links: {},
        },
      ]),
    }),
  },
  
  // Cart API handler
  {
    method: 'GET',
    url: 'https://test-wordpress.com/wp-json/wc/store/cart',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createMockCart()),
    }),
  },
  
  // Add to Cart API handler
  {
    method: 'POST',
    url: 'https://test-wordpress.com/wp-json/wc/store/cart/add-item',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createMockCart()),
    }),
  },
  
  // Update Cart API handler
  {
    method: 'POST',
    url: 'https://test-wordpress.com/wp-json/wc/store/cart/update-item',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createMockCart()),
    }),
  },
  
  // Remove from Cart API handler
  {
    method: 'POST',
    url: 'https://test-wordpress.com/wp-json/wc/store/cart/remove-item',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createMockCart()),
    }),
  },
  
  // Authentication API handler
  {
    method: 'POST',
    url: 'https://test-wordpress.com/wp-json/jwt-auth/v1/token',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'mock-jwt-token',
        user_display_name: 'Test User',
        user_email: 'test@example.com',
        user_nicename: 'testuser',
      }),
    }),
  },
  
  // Customer API handler
  {
    method: 'GET',
    url: /https:\/\/test-wordpress\.com\/wp-json\/wc\/v3\/customers\/\d+/,
    response: (req: any) => {
      const url = new URL(req.url);
      const id = url.pathname.split('/').pop();
      
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createMockUser({ id: Number(id) })),
      };
    },
  },
  
  // System Status API handler
  {
    method: 'GET',
    url: 'https://test-wordpress.com/wp-json/wc/v3/system_status',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        environment: {
          version: '6.0.0',
          wc_version: '8.0.0',
        },
      }),
    }),
  },
  
  // Search API handler
  {
    method: 'GET',
    url: 'https://test-wordpress.com/wp-json/wc/v3/products/search',
    response: () => ({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        createMockProduct({ id: 1, name: 'Search Result 1' }),
        createMockProduct({ id: 2, name: 'Search Result 2' }),
      ]),
    }),
  },
];

// Mock server implementation
class MockServer {
  private handlers: any[] = [];
  private originalFetch: typeof fetch | null = null;
  
  constructor() {
    this.handlers = handlers;
  }
  
  listen(options?: { onUnhandledRequest?: string }): void {
    // Store original fetch
    this.originalFetch = global.fetch;
    
    // Override fetch
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Find matching handler
      for (const handler of this.handlers) {
        if (handler.method === 'GET' || (init && init.method === handler.method)) {
          if (handler.url instanceof RegExp && handler.url.test(url)) {
            const response = handler.response({ url, init });
            return new Response(response.body, {
              status: response.status,
              headers: response.headers,
            });
          } else if (typeof handler.url === 'string' && url.includes(handler.url)) {
            const response = handler.response({ url, init });
            return new Response(response.body, {
              status: response.status,
              headers: response.headers,
            });
          }
        }
      }
      
      // Handle unhandled requests
      if (options?.onUnhandledRequest === 'error') {
        throw new Error(`No handler found for ${url}`);
      }
      
      // Return default response
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  }
  
  resetHandlers(): void {
    // Reset handlers to default
    this.handlers = [...handlers];
  }
  
  close(): void {
    // Restore original fetch
    if (this.originalFetch) {
      global.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }
  
  use(...handlers: any[]): void {
    // Add additional handlers
    this.handlers.push(...handlers);
  }
}

// Create and export server instance
export const server = new MockServer();

// Mock data factories (copied from utils.test.ts to avoid circular dependencies)
function createMockProduct(overrides = {}) {
  return {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    price: '29.99',
    regular_price: '39.99',
    sale_price: '29.99',
    description: '<p>Test product description</p>',
    short_description: '<p>Test short description</p>',
    sku: 'TEST-001',
    status: 'publish',
    featured: false,
    catalog_visibility: 'visible',
    on_sale: true,
    purchasable: true,
    total_sales: 0,
    virtual: false,
    downloadable: false,
    downloads: [],
    download_limit: -1,
    download_expiry: -1,
    external_url: '',
    button_text: '',
    tax_status: 'taxable',
    tax_class: '',
    manage_stock: false,
    stock_quantity: null,
    stock_status: 'instock',
    backorders: 'no',
    backorders_allowed: false,
    backordered: false,
    sold_individually: false,
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    shipping_class: '',
    shipping_class_id: 0,
    reviews_allowed: true,
    average_rating: '4.5',
    rating_count: 10,
    related_ids: [],
    upsell_ids: [],
    cross_sell_ids: [],
    parent_id: 0,
    purchase_note: '',
    categories: [
      {
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
      },
    ],
    tags: [
      {
        id: 1,
        name: 'Test Tag',
        slug: 'test-tag',
      },
    ],
    images: [
      {
        id: 1,
        src: 'https://example.com/image.jpg',
        name: 'Test Image',
        alt: 'Test Product Image',
      },
    ],
    attributes: [],
    default_attributes: [],
    variations: [],
    grouped_products: [],
    menu_order: 0,
    meta_data: [],
    ...overrides,
  };
}

function createMockCart(overrides = {}) {
  return {
    items: [
      {
        key: 'test-key',
        id: 1,
        name: 'Test Product',
        price: '29.99',
        regular_price: '39.99',
        sale_price: '29.99',
        quantity: 1,
        taxable: true,
        tax_status: 'taxable',
        tax_class: '',
        subtotal: '29.99',
        subtotal_tax: '2.40',
        total: '29.99',
        total_tax: '2.40',
        stock_status: 'instock',
        image: {
          id: 1,
          src: 'https://example.com/image.jpg',
          name: 'Test Image',
          alt: 'Test Product Image',
        },
        variations: {},
        quantity_limits: {
          minimum: 1,
          maximum: 99,
          multiple_of: 1,
        },
        cart_item_data: {},
      },
    ],
    totals: {
      total_items: '29.99',
      total_items_tax: '2.40',
      total_fees: '0.00',
      total_fees_tax: '0.00',
      total_discount: '0.00',
      total_discount_tax: '0.00',
      total_shipping: '0.00',
      total_shipping_tax: '0.00',
      total_price: '32.39',
      total_tax: '2.40',
      currency_code: 'USD',
      currency_symbol: '$',
      currency_minor_unit: 2,
      currency_decimal_separator: '.',
      currency_thousand_separator: ',',
      currency_prefix: '$',
      currency_suffix: '',
    },
    shipping_rates: [],
    coupons: [],
    payment_methods: [],
    needs_payment: true,
    needs_shipping: false,
    ...overrides,
  };
}

function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'customer',
    username: 'testuser',
    billing: {
      first_name: 'Test',
      last_name: 'User',
      company: '',
      address_1: '123 Test St',
      address_2: '',
      city: 'Test City',
      state: 'TS',
      postcode: '12345',
      country: 'US',
      email: 'test@example.com',
      phone: '555-1234',
    },
    shipping: {
      first_name: 'Test',
      last_name: 'User',
      company: '',
      address_1: '123 Test St',
      address_2: '',
      city: 'Test City',
      state: 'TS',
      postcode: '12345',
      country: 'US',
    },
    is_paying_customer: true,
    orders_count: 0,
    total_spent: '0.00',
    avatar_url: 'https://example.com/avatar.jpg',
    meta_data: [],
    ...overrides,
  };
}

// Export mock data factories
export { createMockProduct, createMockCart, createMockUser };