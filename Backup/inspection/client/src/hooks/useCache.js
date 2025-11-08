import { useState, useEffect, useCallback } from 'react';
import { CacheManager, PrefetchManager } from '../utils/CacheManager';

// إنشاء نسخة واحدة من مديري التخزين المؤقت والتحميل المسبق
const cacheManager = new CacheManager({
  maxSize: 100 * 1024 * 1024, // 100MB
  maxAge: 60 * 60 * 1000, // ساعة واحدة
  cleanupInterval: 10 * 60 * 1000 // 10 دقائق
});

const prefetchManager = new PrefetchManager(cacheManager);

export function useCache(key, fetchFn, options = {}) {
  const {
    enabled = true,
    prefetch = false,
    prefetchPriority = 'normal',
    dependencies = [],
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دالة لجلب البيانات مع إعادة المحاولة
  const fetchWithRetry = useCallback(async (attempt = 0) => {
    try {
      // محاولة جلب البيانات من التخزين المؤقت أولاً
      let cachedData = await cacheManager.get(key);
      
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        onSuccess?.(cachedData);
        return;
      }

      // جلب البيانات من المصدر
      const freshData = await fetchFn();
      
      // تخزين البيانات في التخزين المؤقت
      await cacheManager.set(key, freshData);
      
      setData(freshData);
      setLoading(false);
      onSuccess?.(freshData);
    } catch (err) {
      if (attempt < retryCount) {
        // إعادة المحاولة بعد فترة
        setTimeout(() => {
          fetchWithRetry(attempt + 1);
        }, retryDelay * Math.pow(2, attempt));
      } else {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
    }
  }, [key, fetchFn, retryCount, retryDelay, onSuccess, onError]);

  // دالة لإعادة تحميل البيانات
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchWithRetry();
  }, [fetchWithRetry]);

  // دالة لمسح البيانات من التخزين المؤقت
  const invalidate = useCallback(() => {
    cacheManager.delete(key);
  }, [key]);

  // تحميل البيانات عند تغيير المعتمدات
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (prefetch) {
      // إضافة الطلب إلى قائمة التحميل المسبق
      prefetchManager.addToPrefetchQueue(key, fetchFn, prefetchPriority);
    } else {
      fetchWithRetry();
    }

    // تنظيف عند إزالة المكون
    return () => {
      if (prefetch) {
        prefetchManager.cancelPrefetch(key);
      }
    };
  }, [enabled, key, fetchFn, prefetch, prefetchPriority, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    cacheStats: cacheManager.getStats()
  };
}

// Hook لإدارة التحميل المسبق
export function usePrefetch() {
  const prefetch = useCallback((key, fetchFn, priority = 'normal') => {
    prefetchManager.addToPrefetchQueue(key, fetchFn, priority);
  }, []);

  const cancelPrefetch = useCallback((key) => {
    prefetchManager.cancelPrefetch(key);
  }, []);

  const clearPrefetchQueue = useCallback(() => {
    prefetchManager.clearPrefetchQueue();
  }, []);

  return {
    prefetch,
    cancelPrefetch,
    clearPrefetchQueue
  };
}

// Hook لإدارة التخزين المؤقت
export function useCacheManager() {
  const clearCache = useCallback(() => {
    cacheManager.clear();
  }, []);

  const getStats = useCallback(() => {
    return cacheManager.getStats();
  }, []);

  return {
    clearCache,
    getStats
  };
} 