// Mock implementations for testing without external dependencies

// Mock IntersectionObserver
if (typeof window !== 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    root: Element | null = null;
    rootMargin: string = '';
    thresholds: number[] = [];
    takeRecords(): IntersectionObserverEntry[] { return []; }
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
};

// Assign mocks to global if window is available
if (typeof window !== 'undefined') {
  global.localStorage = localStorageMock;
  global.sessionStorage = sessionStorageMock;
}

// Mock next/router
const mockRouter = {
  route: '/',
  pathname: '/',
  query: '',
  asPath: '',
  push: () => {},
  pop: () => {},
  reload: () => {},
  back: () => {},
  prefetch: () => {},
  beforePopState: () => {},
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
};

// Mock next/navigation
const mockNavigation = {
  push: () => {},
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => {},
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useRouter: () => mockNavigation,
};

// Mock WebSocket
if (typeof window !== 'undefined') {
  // Create a proper WebSocket mock class that extends the WebSocket interface
  interface MockWebSocket {
    new (url: string | URL, protocols?: string | string[]): MockWebSocketInstance;
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
  }
  
  interface MockWebSocketInstance {
    url: string;
    readyState: number;
    bufferedAmount: number;
    extensions: string;
    protocol: string;
    binaryType: BinaryType;
    close(code?: number, reason?: string): void;
    send(data: string | ArrayBuffer | Blob | ArrayBufferView): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    dispatchEvent(event: Event): boolean;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onopen: ((event: Event) => void) | null;
  }
  
  // Create a proper WebSocket mock class
  const WebSocketMock = function(this: MockWebSocketInstance, url: string | URL, protocols?: string | string[]) {
    this.url = url.toString();
    this.readyState = WebSocketMock.OPEN;
    this.bufferedAmount = 0;
    this.extensions = '';
    this.protocol = '';
    this.binaryType = 'blob';
    this.close = () => {};
    this.send = () => {};
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
    this.dispatchEvent = () => true;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.onopen = null;
  } as any as MockWebSocket;

  WebSocketMock.CONNECTING = 0;
  WebSocketMock.OPEN = 1;
  WebSocketMock.CLOSING = 2;
  WebSocketMock.CLOSED = 3;

  // Assign the mock class to global WebSocket with type assertion
  (global as any).WebSocket = WebSocketMock;
}

// Mock fetch
if (typeof window !== 'undefined') {
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    return new Response(JSON.stringify({}), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
}

// Mock environment variables
if (typeof process !== 'undefined') {
  process.env.NEXT_PUBLIC_WORDPRESS_URL = 'https://test-wordpress.com';
  process.env.NEXT_PUBLIC_WS_URL = 'wss://test-wordpress.com/ws';
}

// Global test utilities
global.createMockProduct = (overrides = {}) => ({
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
});

global.createMockCart = (overrides = {}) => ({
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
});

global.createMockUser = (overrides = {}) => ({
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
});

// Performance monitoring for tests
global.measureTestPerformance = (testName: string, testFn: () => void | Promise<void>) => {
  const start = performance.now();
  const result = testFn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`Test "${testName}" took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`Test "${testName}" took ${end - start} milliseconds`);
    return result;
  }
};

// Export mocks for use in other files
export {
  localStorageMock,
  sessionStorageMock,
  mockRouter,
  mockNavigation,
};

// Setup function to be called before tests
export function setupTestEnvironment() {
  // This function can be called to set up the test environment
  // It's a placeholder for any additional setup needed
  
  // Suppress console warnings in tests unless debugging
  if (typeof console !== 'undefined') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Warning: ReactDOM.render is no longer supported')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
    
    // Return a cleanup function
    return () => {
      console.error = originalError;
    };
  }
  
  return () => {};
}

// Simple DOM element matchers (without jest)
export function createTestMatchers() {
  return {
    toBeInTheDocument: (received: Element) => {
      const pass = received && document.body.contains(received);
      return {
        pass,
        message: () =>
          pass
            ? `expected element not to be in the document`
            : `expected element to be in the document`,
      };
    },
    
    toHaveClass: (received: Element, className: string) => {
      const pass = received && received.classList && received.classList.contains(className);
      return {
        pass,
        message: () =>
          pass
            ? `expected element not to have class "${className}"`
            : `expected element to have class "${className}"`,
      };
    },
    
    toBeDisabled: (received: Element) => {
      const pass = received && (received as HTMLInputElement).disabled;
      return {
        pass,
        message: () =>
          pass
            ? `expected element not to be disabled`
            : `expected element to be disabled`,
      };
    },
  };
}

// Export a simple assertion function
export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Export mock router functions
export function useRouter() {
  return mockRouter;
}

export function useNavigation() {
  return mockNavigation;
}