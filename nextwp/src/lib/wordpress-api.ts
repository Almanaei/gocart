
import axios from 'axios';
import { 
  WordPressPost, 
  WordPressPage, 
  WordPressCategory, 
  WordPressTag, 
  WordPressMedia,
  WordPressMenu,
  WooCommerceProduct,
  WooCommerceProductCategory,
  WooCommerceProductTag,
  WooCommerceProductImage,
  WooCommerceCart,
  WooCommerceCartItem,
  WooCommerceCustomer,
  WooCommerceOrder
} from '@/types/wordpress';

// WordPress API configuration
const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com';
const API_BASE = `${WP_API_URL}/wp-json/wp/v2`;
const WC_API_BASE = `${WP_API_URL}/wp-json/wc/v3`;
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || '';

// Create an axios instance for WordPress API
const wpApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an axios instance for WooCommerce API
const wcApi = axios.create({
  baseURL: WC_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
  },
});

// WordPress API Services
export const wpService = {
  // Posts
  getPosts: async (params?: any) => {
    const response = await wpApi.get<WordPressPost[]>('/posts', { params });
    return response.data;
  },

  getPost: async (id: number) => {
    const response = await wpApi.get<WordPressPost>(`/posts/${id}`);
    return response.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await wpApi.get<WordPressPost[]>('/posts', { params: { slug } });
    return response.data[0]; // Return the first (and hopefully only) post with this slug
  },

  // Pages
  getPages: async (params?: any) => {
    const response = await wpApi.get<WordPressPage[]>('/pages', { params });
    return response.data;
  },

  getPage: async (id: number) => {
    const response = await wpApi.get<WordPressPage>(`/pages/${id}`);
    return response.data;
  },

  getPageBySlug: async (slug: string) => {
    const response = await wpApi.get<WordPressPage[]>('/pages', { params: { slug } });
    return response.data[0]; // Return the first (and hopefully only) page with this slug
  },

  // Categories
  getCategories: async (params?: any) => {
    const response = await wpApi.get<WordPressCategory[]>('/categories', { params });
    return response.data;
  },

  getCategory: async (id: number) => {
    const response = await wpApi.get<WordPressCategory>(`/categories/${id}`);
    return response.data;
  },

  // Tags
  getTags: async (params?: any) => {
    const response = await wpApi.get<WordPressTag[]>('/tags', { params });
    return response.data;
  },

  // Media
  getMedia: async (params?: any) => {
    const response = await wpApi.get<WordPressMedia[]>('/media', { params });
    return response.data;
  },

  getMediaItem: async (id: number) => {
    const response = await wpApi.get<WordPressMedia>(`/media/${id}`);
    return response.data;
  },

  // Menus (requires a specific plugin like "WP REST API Menu")
  getMenus: async () => {
    try {
      const response = await axios.get<WordPressMenu[]>(`${WP_API_URL}/wp-json/menus/v1/menus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      return [];
    }
  },

  getMenu: async (id: number): Promise<WordPressMenu | null> => {
    try {
      const response = await axios.get<WordPressMenu>(`${WP_API_URL}/wp-json/menus/v1/menus/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      return null;
    }
  },
};

// WooCommerce API Services
export const wcService = {
  // Products
  getProducts: async (params?: any) => {
    const response = await wcApi.get<WooCommerceProduct[]>('/products', { params });
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await wcApi.get<WooCommerceProduct>(`/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug: string) => {
    try {
      // First try exact match
      let response = await wcApi.get<WooCommerceProduct[]>('/products', { params: { slug } });
      
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      
      // If no exact match, try case-insensitive search
      response = await wcApi.get<WooCommerceProduct[]>('/products');
      const allProducts = response.data;
      
      // Try to find a product with a matching slug (case-insensitive)
      const matchingProduct = allProducts.find(product => 
        product.slug.toLowerCase() === slug.toLowerCase()
      );
      
      if (matchingProduct) {
        return matchingProduct;
      }
      
      // If still no match, try to find by partial match
      const partialMatchProduct = allProducts.find(product => 
        product.slug.toLowerCase().includes(slug.toLowerCase()) || 
        slug.toLowerCase().includes(product.slug.toLowerCase())
      );
      
      return partialMatchProduct || null;
    } catch (error) {
      console.error(`Error fetching product by slug (${slug}):`, error);
      return null;
    }
  },

  // Product Categories
  getProductCategories: async (params?: any) => {
    const response = await wcApi.get<WooCommerceProductCategory[]>('/products/categories', { params });
    return response.data;
  },

  // Product Tags
  getProductTags: async (params?: any) => {
    const response = await wcApi.get<WooCommerceProductTag[]>('/products/tags', { params });
    return response.data;
  },

  // Cart
  getCart: async () => {
    try {
      // In a real app, you would use authentication tokens to retrieve the user's cart
      // For now, we'll use a session-based approach or anonymous cart
      const response = await axios.get<WooCommerceCart>(`${WP_API_URL}/wp-json/wc/store/cart`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  },

  addToCart: async (productId: number, quantity: number = 1) => {
    try {
      const response = await axios.post<WooCommerceCart>(`${WP_API_URL}/wp-json/wc/store/cart/add-item`, {
        id: productId.toString(),
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  },

  updateCartItem: async (cartKey: string, quantity: number) => {
    try {
      const response = await axios.post<WooCommerceCart>(`${WP_API_URL}/wp-json/wc/store/cart/update-item`, {
        key: cartKey,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  },

  removeFromCart: async (cartKey: string) => {
    try {
      const response = await axios.post<WooCommerceCart>(`${WP_API_URL}/wp-json/wc/store/cart/remove-item`, {
        key: cartKey
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return null;
    }
  },

  // Customer
  getCustomer: async (customerId: number) => {
    const response = await wcApi.get<WooCommerceCustomer>(`/customers/${customerId}`);
    return response.data;
  },

  // Orders
  getOrders: async (customerId?: number, params?: any) => {
    const response = await wcApi.get<WooCommerceOrder[]>('/orders', { 
      params: { 
        ...(customerId && { customer: customerId }),
        ...params 
      } 
    });
    return response.data;
  },

  getOrder: async (id: number) => {
    const response = await wcApi.get<WooCommerceOrder>(`/orders/${id}`);
    return response.data;
  },
};

// Utility function to build image URLs with a specific size
export const getImageUrl = (media: WordPressMedia, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'medium') => {
  if (!media.media_details || !media.media_details.sizes) {
    return media.source_url;
  }

  if (size === 'full') {
    return media.source_url;
  }

  return media.media_details.sizes[size]?.source_url || media.source_url;
};

// Search functionality
export const searchProducts = async (query: string, params?: any) => {
  const response = await wcApi.get<WooCommerceProduct[]>('/products', { 
    params: {
      search: query,
      ...params
    } 
  });
  return response.data;
};
