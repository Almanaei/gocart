// Dynamic import to avoid SSR issues
let Redis: any = null;

if (typeof window === 'undefined') {
  try {
    Redis = require('ioredis');
  } catch (error) {
    console.warn('ioredis not available, falling back to memory cache');
  }
}

// Redis client configuration
class RedisCache {
  private client: any | null = null;
  private isConnected = false;
  private fallbackCache = new Map<string, { value: any; expiresAt: number }>();

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    // Only initialize Redis in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_REDIS === 'true') {
      try {
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.client.on('connect', () => {
          console.log('Redis connected successfully');
          this.isConnected = true;
        });

        this.client.on('error', (error) => {
          console.error('Redis connection error:', error);
          this.isConnected = false;
        });

        this.client.on('close', () => {
          console.log('Redis connection closed');
          this.isConnected = false;
        });

        // Test connection
        await this.client.connect();
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        this.client = null;
        this.isConnected = false;
      }
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isConnected && this.client) {
        await this.client.setex(key, ttlSeconds, serializedValue);
      } else {
        // Fallback to memory cache
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.fallbackCache.set(key, { value, expiresAt });
      }
    } catch (error) {
      console.error('Error setting cache:', error);
      // Fallback to memory cache
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.fallbackCache.set(key, { value, expiresAt });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        return this.getFromMemoryCache<T>(key);
      }
    } catch (error) {
      console.error('Error getting cache:', error);
      // Fallback to memory cache
      return this.getFromMemoryCache<T>(key);
    }
  }

  private getFromMemoryCache<T>(key: string): T | null {
    const item = this.fallbackCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.fallbackCache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      } else {
        this.fallbackCache.delete(key);
      }
    } catch (error) {
      console.error('Error deleting cache:', error);
      this.fallbackCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushdb();
      } else {
        this.fallbackCache.clear();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.fallbackCache.clear();
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        const result = await this.client.exists(key);
        return result === 1;
      } else {
        return this.fallbackCache.has(key) && Date.now() <= this.fallbackCache.get(key)!.expiresAt;
      }
    } catch (error) {
      console.error('Error checking cache existence:', error);
      return false;
    }
  }

  async increment(key: string, count: number = 1): Promise<number> {
    try {
      if (this.isConnected && this.client) {
        return await this.client.incrby(key, count);
      } else {
        // Fallback implementation
        const current = await this.get<number>(key) || 0;
        const newValue = current + count;
        await this.set(key, newValue, 300); // 5 minutes default TTL
        return newValue;
      }
    } catch (error) {
      console.error('Error incrementing cache:', error);
      return 0;
    }
  }

  async setMultiple(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        const pipeline = this.client.pipeline();
        keyValuePairs.forEach(({ key, value, ttl = 300 }) => {
          pipeline.setex(key, ttl, JSON.stringify(value));
        });
        await pipeline.exec();
      } else {
        // Fallback to memory cache
        keyValuePairs.forEach(({ key, value, ttl = 300 }) => {
          const expiresAt = Date.now() + ttl * 1000;
          this.fallbackCache.set(key, { value, expiresAt });
        });
      }
    } catch (error) {
      console.error('Error setting multiple cache values:', error);
      // Fallback to memory cache
      keyValuePairs.forEach(({ key, value, ttl = 300 }) => {
        const expiresAt = Date.now() + ttl * 1000;
        this.fallbackCache.set(key, { value, expiresAt });
      });
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      if (this.isConnected && this.client) {
        const values = await this.client.mget(...keys);
        const result: Record<string, T | null> = {};
        
        keys.forEach((key, index) => {
          const value = values[index];
          result[key] = value ? JSON.parse(value) : null;
        });
        
        return result;
      } else {
        // Fallback to memory cache
        const result: Record<string, T | null> = {};
        keys.forEach(key => {
          result[key] = this.getFromMemoryCache<T>(key);
        });
        return result;
      }
    } catch (error) {
      console.error('Error getting multiple cache values:', error);
      // Fallback to memory cache
      const result: Record<string, T | null> = {};
      keys.forEach(key => {
        result[key] = this.getFromMemoryCache<T>(key);
      });
      return result;
    }
  }

  // Cache with automatic TTL based on content type
  async smartSet(key: string, value: any, type: 'product' | 'category' | 'cart' | 'user' | 'general' = 'general'): Promise<void> {
    const ttlMap = {
      product: 300, // 5 minutes
      category: 600, // 10 minutes
      cart: 60, // 1 minute
      user: 1800, // 30 minutes
      general: 300, // 5 minutes
    };
    
    await this.set(key, value, ttlMap[type]);
  }

  // Health check for Redis
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      if (!this.isConnected || !this.client) {
        return { status: 'unhealthy', error: 'Redis not connected' };
      }
      
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      return { status: 'healthy', latency };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Clean up expired entries in memory cache
  cleanupMemoryCache(): void {
    if (this.isConnected) return; // Skip if Redis is connected
    
    const now = Date.now();
    this.fallbackCache.forEach((item, key) => {
      if (now > item.expiresAt) {
        this.fallbackCache.delete(key);
      }
    });
  }

  // Close Redis connection
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache();

// Clean up memory cache every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    redisCache.cleanupMemoryCache();
  }, 5 * 60 * 1000);
}

// Cache wrapper for API calls with Redis
export async function withRedisCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300,
  type: 'product' | 'category' | 'cart' | 'user' | 'general' = 'general'
): Promise<T> {
  // Try to get from cache first
  const cached = await redisCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // If not in cache, execute the function
  const result = await fn();
  
  // Store in cache
  await redisCache.smartSet(key, result, type);
  
  return result;
}

// Cache invalidation utilities
export const cacheKeys = {
  product: (id: number) => `product:${id}`,
  productSlug: (slug: string) => `product:slug:${slug}`,
  products: (params: any) => `products:${JSON.stringify(params)}`,
  category: (id: number) => `category:${id}`,
  categories: (params?: any) => `categories${params ? `:${JSON.stringify(params)}` : ''}`,
  cart: (userId?: number) => `cart${userId ? `:${userId}` : ''}`,
  user: (id: number) => `user:${id}`,
  search: (query: string) => `search:${query}`,
};

// Invalidate related cache entries
export async function invalidateProductCache(productId: number, productSlug?: string): Promise<void> {
  const keysToDelete = [
    cacheKeys.product(productId),
  ];
  
  if (productSlug) {
    keysToDelete.push(cacheKeys.productSlug(productSlug));
  }
  
  // Delete all product lists (they might contain this product)
  // In a real implementation, you might want to track these keys more efficiently
  // For now, we'll clear the entire product cache
  await redisCache.delete('products:*');
  
  // Delete specific keys
  for (const key of keysToDelete) {
    await redisCache.delete(key);
  }
}

export async function invalidateCartCache(userId?: number): Promise<void> {
  await redisCache.delete(cacheKeys.cart(userId));
}

export async function invalidateUserCache(userId: number): Promise<void> {
  await redisCache.delete(cacheKeys.user(userId));
}