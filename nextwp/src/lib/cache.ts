import { redisCache, withRedisCache, cacheKeys } from './redis-cache';

// Unified cache interface that works with both Redis and memory cache
class UnifiedCache {
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    await redisCache.set(key, value, ttlSeconds);
  }
  
  async get<T>(key: string): Promise<T | null> {
    return await redisCache.get<T>(key);
  }
  
  async delete(key: string): Promise<void> {
    await redisCache.delete(key);
  }
  
  async clear(): Promise<void> {
    await redisCache.clear();
  }
  
  async exists(key: string): Promise<boolean> {
    return await redisCache.exists(key);
  }
  
  async setMultiple(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    await redisCache.setMultiple(keyValuePairs);
  }
  
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    return await redisCache.getMultiple<T>(keys);
  }
  
  // Smart caching with automatic TTL based on content type
  async smartSet(key: string, value: any, type: 'product' | 'category' | 'cart' | 'user' | 'general' = 'general'): Promise<void> {
    await redisCache.smartSet(key, value, type);
  }
  
  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    return await redisCache.healthCheck();
  }
}

export const cache = new UnifiedCache();

// Clean up expired cache entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    // Redis handles cleanup automatically
    redisCache.cleanupMemoryCache();
  }, 5 * 60 * 1000);
}

// Cache wrapper for API calls
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300,
  type: 'product' | 'category' | 'cart' | 'user' | 'general' = 'general'
): Promise<T> {
  return await withRedisCache(key, fn, ttlSeconds, type);
}

// React Query cache configuration
export const queryCacheConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
};

// Export cache keys for consistency
export { cacheKeys };

// Export Redis utilities
export { invalidateProductCache, invalidateCartCache, invalidateUserCache } from './redis-cache';

// Image optimization utilities
export function getOptimizedImageUrl(
  src: string,
  width: number,
  height?: number,
  quality: number = 80
): string {
  // If it's already an optimized URL, return it
  if (src.includes('?')) {
    return src;
  }
  
  // For external images, we can't optimize them
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local images, add optimization parameters
  let optimizedUrl = `${src}?w=${width}&q=${quality}`;
  
  if (height) {
    optimizedUrl += `&h=${height}`;
  }
  
  return optimizedUrl;
}

// Lazy loading utility for images
export function createImageObserver(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '200px', // Start loading 200px before entering viewport
    threshold: 0.01,
  });
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  startTiming(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
    };
  }
  
  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }
  
  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((times, name) => {
      const sum = times.reduce((acc, time) => acc + time, 0);
      result[name] = {
        average: sum / times.length,
        count: times.length,
      };
    });
    
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

import React from 'react';

// Bundle size optimization
export function loadComponent(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<React.ComponentType<any>> {
  return React.lazy(importFunc);
}

// Resource hints for performance
export function addResourceHints(): void {
  if (typeof document === 'undefined') return;
  
  // Preconnect to external domains
  const domains = [
    process.env.WORDPRESS_URL,
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ].filter(Boolean);
  
  domains.forEach(domain => {
    if (!domain) return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
  
  // DNS prefetch for less critical domains
  const dnsPrefetchDomains = [
    'https://www.google-analytics.com',
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

// Critical CSS inlining for performance
export function getCriticalCSS(): string {
  // In a real implementation, you would extract critical CSS
  // For now, return a basic critical CSS
  return `
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    * {
      box-sizing: border-box;
    }
    
    img {
      max-width: 100%;
      height: auto;
    }
  `;
}