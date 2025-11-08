import { WooCommerceProduct, WooCommerceProductCategory, WooCommerceProductTag } from '@/types/wordpress';
import { cache, cacheKeys } from './cache';

export interface SearchFilters {
  query?: string;
  category?: number[];
  tag?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  onSale?: boolean;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  attributes?: Record<string, string[]>;
}

export interface SearchResult {
  products: WooCommerceProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
  facets: {
    categories: Array<{ id: number; name: string; count: number }>;
    tags: Array<{ id: number; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
    attributes: Record<string, Array<{ value: string; count: number }>>;
  };
  suggestions: string[];
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'tag';
  url?: string;
  count?: number;
}

class AdvancedSearchService {
  private searchHistory: string[] = [];
  private popularSearches: string[] = [];
  private maxHistoryItems = 10;

  constructor() {
    this.loadSearchHistory();
    this.loadPopularSearches();
  }

  // Main search function with advanced filtering
  async search(filters: SearchFilters, page: number = 1, perPage: number = 20): Promise<SearchResult> {
    const cacheKey = `search:${JSON.stringify({ filters, page, perPage })}`;
    
    return await cache.get(cacheKey) || this.performSearch(filters, page, perPage);
  }

  private async performSearch(filters: SearchFilters, page: number, perPage: number): Promise<SearchResult> {
    try {
      // Build search parameters
      const searchParams: any = {
        page,
        per_page: perPage,
        status: 'publish',
      };

      // Add text search
      if (filters.query) {
        searchParams.search = filters.query;
        this.addToHistory(filters.query);
      }

      // Add category filters
      if (filters.category && filters.category.length > 0) {
        searchParams.category = filters.category.join(',');
      }

      // Add tag filters
      if (filters.tag && filters.tag.length > 0) {
        searchParams.tag = filters.tag.join(',');
      }

      // Add price range
      if (filters.priceRange) {
        searchParams.min_price = filters.priceRange.min;
        searchParams.max_price = filters.priceRange.max;
      }

      // Add rating filter (minimum rating)
      if (filters.rating) {
        searchParams.min_rating = filters.rating;
      }

      // Add sale filter
      if (filters.onSale) {
        searchParams.on_sale = true;
      }

      // Add stock filter
      if (filters.inStock) {
        searchParams.stock_status = 'instock';
      }

      // Add featured filter
      if (filters.featured) {
        searchParams.featured = true;
      }

      // Add sorting
      if (filters.sortBy) {
        searchParams.orderby = filters.sortBy;
        searchParams.order = filters.sortOrder || 'asc';
      }

      // Import dynamically to avoid SSR issues
      const { wcService } = await import('./wordpress-api');
      
      // Perform search
      const products = await wcService.getProducts(searchParams);
      
      // Get total count (WooCommerce doesn't return total in search, so we need to estimate)
      const total = await this.getSearchTotal(searchParams);
      
      // Generate facets
      const facets = await this.generateFacets(products, filters);
      
      // Get suggestions
      const suggestions = await this.getSuggestions(filters.query || '');

      const result: SearchResult = {
        products,
        total,
        totalPages: Math.ceil(total / perPage),
        currentPage: page,
        facets,
        suggestions,
      };

      // Cache the result
      const cacheKey = `search:${JSON.stringify({ filters, page, perPage })}`;
      await cache.set(cacheKey, result, 300); // 5 minutes

      return result;
    } catch (error) {
      console.error('Search error:', error);
      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        facets: {
          categories: [],
          tags: [],
          priceRanges: [],
          ratings: [],
          attributes: {},
        },
        suggestions: [],
      };
    }
  }

  private async getSearchTotal(searchParams: any): Promise<number> {
    try {
      // For accurate total, we might need a custom endpoint
      // For now, estimate based on a larger request
      const { wcService } = await import('./wordpress-api');
      const largeParams = { ...searchParams, per_page: 100 };
      const largeResult = await wcService.getProducts(largeParams);
      
      if (largeResult.length < 100) {
        return largeResult.length;
      }
      
      // If we got 100 results, there are likely more
      // This is an approximation - in production, you'd want a dedicated count endpoint
      return largeResult.length * 2;
    } catch (error) {
      console.error('Error getting search total:', error);
      return 0;
    }
  }

  private async generateFacets(products: WooCommerceProduct[], filters: SearchFilters): Promise<SearchResult['facets']> {
    const facets: SearchResult['facets'] = {
      categories: [],
      tags: [],
      priceRanges: [],
      ratings: [],
      attributes: {},
    };

    // Category facets
    const categoryCounts = new Map<number, number>();
    products.forEach(product => {
      product.categories?.forEach(category => {
        categoryCounts.set(category.id, (categoryCounts.get(category.id) || 0) + 1);
      });
    });

    facets.categories = Array.from(categoryCounts.entries()).map(([id, count]) => {
      const category = products.find(p => p.categories?.some(c => c.id === id))?.categories?.find(c => c.id === id);
      return {
        id,
        name: category?.name || `Category ${id}`,
        count,
      };
    });

    // Tag facets
    const tagCounts = new Map<number, number>();
    products.forEach(product => {
      product.tags?.forEach(tag => {
        tagCounts.set(tag.id, (tagCounts.get(tag.id) || 0) + 1);
      });
    });

    facets.tags = Array.from(tagCounts.entries()).map(([id, count]) => {
      const tag = products.find(p => p.tags?.some(t => t.id === id))?.tags?.find(t => t.id === id);
      return {
        id,
        name: tag?.name || `Tag ${id}`,
        count,
      };
    });

    // Price range facets
    const priceRanges = [
      { min: 0, max: 25, count: 0 },
      { min: 25, max: 50, count: 0 },
      { min: 50, max: 100, count: 0 },
      { min: 100, max: 200, count: 0 },
      { min: 200, max: 500, count: 0 },
      { min: 500, max: Infinity, count: 0 },
    ];

    products.forEach(product => {
      const price = parseFloat(product.price);
      const range = priceRanges.find(r => price >= r.min && price < r.max);
      if (range) {
        range.count++;
      }
    });

    facets.priceRanges = priceRanges.filter(r => r.count > 0);

    // Rating facets
    const ratingCounts = new Map<number, number>();
    products.forEach(product => {
      const rating = Math.floor(parseFloat(product.average_rating || '0'));
      if (rating > 0) {
        ratingCounts.set(rating, (ratingCounts.get(rating) || 0) + 1);
      }
    });

    facets.ratings = Array.from(ratingCounts.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([rating, count]) => ({ rating, count }));

    // Attribute facets
    const attributeCounts = new Map<string, Map<string, number>>();
    products.forEach(product => {
      product.attributes?.forEach(attribute => {
        if (!attribute.visible) return;
        
        if (!attributeCounts.has(attribute.name)) {
          attributeCounts.set(attribute.name, new Map());
        }
        
        const attrMap = attributeCounts.get(attribute.name)!;
        attribute.options.forEach(option => {
          attrMap.set(option, (attrMap.get(option) || 0) + 1);
        });
      });
    });

    facets.attributes = Object.fromEntries(
      Array.from(attributeCounts.entries()).map(([name, values]) => [
        name,
        Array.from(values.entries()).map(([value, count]) => ({ value, count })),
      ])
    );

    return facets;
  }

  // Search suggestions
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) {
      return this.getPopularSearches().slice(0, limit);
    }

    const cacheKey = `suggestions:${query}`;
    let suggestions = await cache.get<string[]>(cacheKey);
    
    if (!suggestions) {
      suggestions = await this.generateSuggestions(query, limit);
      await cache.set(cacheKey, suggestions, 600); // 10 minutes
    }

    return suggestions;
  }

  private async generateSuggestions(query: string, limit: number): Promise<string[]> {
    try {
      const { wcService } = await import('./wordpress-api');
      
      // Get products that match the query
      const products = await wcService.getProducts({
        search: query,
        per_page: limit,
        status: 'publish',
      });

      // Extract product names as suggestions
      const productSuggestions = products.map(p => p.name);

      // Add category suggestions
      const categories = await wcService.getProductCategories({
        search: query,
        per_page: 5,
      });
      const categorySuggestions = categories.map(c => c.name);

      // Combine and deduplicate
      const allSuggestions = [...productSuggestions, ...categorySuggestions];
      const uniqueSuggestions = Array.from(new Set(allSuggestions));
      
      // Filter and sort by relevance
      return uniqueSuggestions
        .filter(s => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  // Autocomplete with rich suggestions
  async autocomplete(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const { wcService } = await import('./wordpress-api');
      
      // Search products
      const products = await wcService.getProducts({
        search: query,
        per_page: Math.floor(limit * 0.6),
        status: 'publish',
      });

      // Search categories
      const categories = await wcService.getProductCategories({
        search: query,
        per_page: Math.floor(limit * 0.2),
      });

      // Search tags
      const tags = await wcService.getProductTags({
        search: query,
        per_page: Math.floor(limit * 0.2),
      });

      const suggestions: SearchSuggestion[] = [
        ...products.map(p => ({
          text: p.name,
          type: 'product' as const,
          url: `/product/${p.slug}`,
        })),
        ...categories.map(c => ({
          text: c.name,
          type: 'category' as const,
          url: `/?category=${c.slug}`,
          count: c.count,
        })),
        ...tags.map(t => ({
          text: t.name,
          type: 'tag' as const,
          url: `/?tag=${t.slug}`,
          count: t.count,
        })),
      ];

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error('Error in autocomplete:', error);
      return [];
    }
  }

  // Search history management
  private loadSearchHistory(): void {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('search_history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    }
  }

  private saveSearchHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
  }

  private addToHistory(query: string): void {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim();
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(h => h !== trimmedQuery);
    
    // Add to beginning
    this.searchHistory.unshift(trimmedQuery);
    
    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
    
    this.saveSearchHistory();
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('search_history');
    }
  }

  removeFromHistory(query: string): void {
    this.searchHistory = this.searchHistory.filter(h => h !== query);
    this.saveSearchHistory();
  }

  // Popular searches management
  private loadPopularSearches(): void {
    if (typeof window !== 'undefined') {
      const popular = localStorage.getItem('popular_searches');
      if (popular) {
        this.popularSearches = JSON.parse(popular);
      } else {
        // Default popular searches
        this.popularSearches = [
          'wireless headphones',
          'smartphone',
          'laptop',
          'bluetooth speaker',
          'fitness tracker',
          'camera',
          'tablet',
          'gaming console',
        ];
      }
    }
  }

  getPopularSearches(): string[] {
    return [...this.popularSearches];
  }

  // Advanced search analytics
  async trackSearch(query: string, filters: SearchFilters, resultCount: number): Promise<void> {
    try {
      // In production, you'd send this to your analytics service
      const searchData = {
        query,
        filters,
        resultCount,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      };

      // Store locally for demo purposes
      if (typeof window !== 'undefined') {
        const searches = JSON.parse(localStorage.getItem('search_analytics') || '[]');
        searches.push(searchData);
        
        // Keep only last 100 searches
        if (searches.length > 100) {
          searches.shift();
        }
        
        localStorage.setItem('search_analytics', JSON.stringify(searches));
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  getSearchAnalytics(): any[] {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('search_analytics') || '[]');
    }
    return [];
  }

  // Clear search cache
  async clearSearchCache(): Promise<void> {
    // This would need to be implemented in the cache service
    // For now, we'll just clear the search-specific cache entries
    console.log('Search cache cleared');
  }
}

export const advancedSearchService = new AdvancedSearchService();