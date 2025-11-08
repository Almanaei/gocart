import { woocommerceAPI } from '../wordpress';
import { 
  WooCommerceProduct, 
  WooCommerceProductCategory, 
  WooCommerceProductTag 
} from '../../types/wordpress';

export class ProductService {
  // Product fetching with caching
  private productCache = new Map<string, WooCommerceProduct[]>();
  private categoryCache = new Map<string, WooCommerceProductCategory[]>();
  private tagCache = new Map<string, WooCommerceProductTag[]>();

  // Get products with advanced filtering
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
  } = {}): Promise<WooCommerceProduct[]> {
    const cacheKey = JSON.stringify(params);
    
    // Check cache first
    if (this.productCache.has(cacheKey)) {
      return this.productCache.get(cacheKey)!;
    }

    try {
      const products = await woocommerceAPI.getProducts(params);
      
      // Cache the result
      this.productCache.set(cacheKey, products);
      
      // Set cache expiration (5 minutes)
      setTimeout(() => {
        this.productCache.delete(cacheKey);
      }, 5 * 60 * 1000);

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(id: number): Promise<WooCommerceProduct> {
    try {
      return await woocommerceAPI.getProduct(id);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  // Get product by slug
  async getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
    try {
      const products = await this.getProducts({ search: slug });
      return products.find(p => p.slug === slug) || null;
    } catch (error) {
      console.error(`Error fetching product by slug ${slug}:`, error);
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      featured: true,
      per_page: limit,
      status: 'publish'
    });
  }

  // Get products on sale
  async getSaleProducts(limit: number = 8): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      on_sale: true,
      per_page: limit,
      status: 'publish'
    });
  }

  // Get new products (recently added)
  async getNewProducts(limit: number = 8): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      orderby: 'date',
      order: 'desc',
      per_page: limit,
      status: 'publish'
    });
  }

  // Get best selling products
  async getBestSellingProducts(limit: number = 8): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      orderby: 'popularity',
      order: 'desc',
      per_page: limit,
      status: 'publish'
    });
  }

  // Get related products
  async getRelatedProducts(productId: number, limit: number = 4): Promise<WooCommerceProduct[]> {
    try {
      const product = await this.getProduct(productId);
      const relatedIds = product.related_ids.slice(0, limit);
      
      if (relatedIds.length === 0) {
        // Fallback: get products from same categories
        const categoryIds = product.categories.map(cat => cat.id);
        if (categoryIds.length > 0) {
          return this.getProducts({
            category: categoryIds[0],
            per_page: limit,
            exclude: [productId]
          });
        }
        return [];
      }

      // Fetch related products by IDs
      const relatedPromises = relatedIds.map(id => this.getProduct(id));
      return Promise.all(relatedPromises);
    } catch (error) {
      console.error(`Error fetching related products for ${productId}:`, error);
      return [];
    }
  }

  // Get product categories
  async getCategories(params: {
    page?: number;
    per_page?: number;
    search?: string;
    parent?: number;
    hide_empty?: boolean;
  } = {}): Promise<WooCommerceProductCategory[]> {
    const cacheKey = JSON.stringify({ categories: params });
    
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey)!;
    }

    try {
      const categories = await woocommerceAPI.getProductCategories(params);
      
      this.categoryCache.set(cacheKey, categories);
      setTimeout(() => {
        this.categoryCache.delete(cacheKey);
      }, 5 * 60 * 1000);

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get all categories (for navigation)
  async getAllCategories(): Promise<WooCommerceProductCategory[]> {
    return this.getCategories({
      per_page: 100,
      hide_empty: true
    });
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<WooCommerceProductCategory | null> {
    try {
      const categories = await this.getCategories({ search: slug });
      return categories.find(cat => cat.slug === slug) || null;
    } catch (error) {
      console.error(`Error fetching category by slug ${slug}:`, error);
      throw error;
    }
  }

  // Get product tags
  async getTags(params: {
    page?: number;
    per_page?: number;
    search?: string;
    hide_empty?: boolean;
  } = {}): Promise<WooCommerceProductTag[]> {
    const cacheKey = JSON.stringify({ tags: params });
    
    if (this.tagCache.has(cacheKey)) {
      return this.tagCache.get(cacheKey)!;
    }

    try {
      const tags = await woocommerceAPI.getProductTags(params);
      
      this.tagCache.set(cacheKey, tags);
      setTimeout(() => {
        this.tagCache.delete(cacheKey);
      }, 5 * 60 * 1000);

      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query: string, limit: number = 10): Promise<WooCommerceProduct[]> {
    if (!query.trim()) return [];
    
    return this.getProducts({
      search: query,
      per_page: limit,
      status: 'publish'
    });
  }

  // Get products by category
  async getProductsByCategory(categoryId: number, params: {
    page?: number;
    per_page?: number;
    orderby?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
    order?: 'asc' | 'desc';
  } = {}): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      ...params,
      category: categoryId,
      status: 'publish'
    });
  }

  // Get products by tag
  async getProductsByTag(tagId: number, params: {
    page?: number;
    per_page?: number;
    orderby?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
    order?: 'asc' | 'desc';
  } = {}): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      ...params,
      tag: tagId,
      status: 'publish'
    });
  }

  // Get products in price range
  async getProductsByPriceRange(minPrice: number, maxPrice: number, params: {
    page?: number;
    per_page?: number;
    orderby?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
    order?: 'asc' | 'desc';
  } = {}): Promise<WooCommerceProduct[]> {
    return this.getProducts({
      ...params,
      min_price: minPrice,
      max_price: maxPrice,
      status: 'publish'
    });
  }

  // Clear cache
  clearCache(): void {
    this.productCache.clear();
    this.categoryCache.clear();
    this.tagCache.clear();
  }

  // Format product price
  formatPrice(price: string | number, currencySymbol: string = '$'): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${currencySymbol}${numPrice.toFixed(2)}`;
  }

  // Check if product is on sale
  isOnSale(product: WooCommerceProduct): boolean {
    return product.on_sale && product.sale_price !== '';
  }

  // Get discount percentage
  getDiscountPercentage(product: WooCommerceProduct): number {
    if (!this.isOnSale(product)) return 0;
    
    const regularPrice = parseFloat(product.regular_price);
    const salePrice = parseFloat(product.sale_price);
    
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  }

  // Check if product is in stock
  isInStock(product: WooCommerceProduct): boolean {
    return product.stock_status === 'instock';
  }

  // Get product image URL
  getProductImageUrl(product: WooCommerceProduct, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'full'): string {
    if (product.images && product.images.length > 0) {
      return product.images[0].src;
    }
    return '/api/placeholder/300/300'; // Fallback placeholder
  }

  // Get product variations
  async getProductVariations(productId: number): Promise<any[]> {
    try {
      return await woocommerceAPI.getProductVariations(productId);
    } catch (error) {
      console.error(`Error fetching variations for product ${productId}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const productService = new ProductService();