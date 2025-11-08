// CacheManager.js
class CacheManager {
  constructor(options = {}) {
    this.options = {
      maxSize: options.maxSize || 50 * 1024 * 1024, // 50MB default
      maxAge: options.maxAge || 30 * 60 * 1000, // 30 minutes default
      cleanupInterval: options.cleanupInterval || 5 * 60 * 1000, // 5 minutes default
      ...options
    };

    this.cache = new Map();
    this.size = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };

    // بدء عملية التنظيف الدوري
    this.startCleanupInterval();
  }

  // إضافة عنصر إلى التخزين المؤقت
  async set(key, value, metadata = {}) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        size: this.calculateSize(value),
        metadata
      };

      // التحقق من حجم العنصر
      if (item.size > this.options.maxSize) {
        console.warn(`العنصر ${key} كبير جداً للتخزين المؤقت`);
        return false;
      }

      // إخلاء مساحة إذا لزم الأمر
      while (this.size + item.size > this.options.maxSize) {
        this.evictOldest();
      }

      // تخزين العنصر
      this.cache.set(key, item);
      this.size += item.size;

      return true;
    } catch (error) {
      console.error('خطأ في تخزين العنصر:', error);
      return false;
    }
  }

  // استرجاع عنصر من التخزين المؤقت
  async get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }

    // التحقق من صلاحية العنصر
    if (Date.now() - item.timestamp > this.options.maxAge) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  // حذف عنصر من التخزين المؤقت
  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      this.size -= item.size;
      this.cache.delete(key);
      this.stats.evictions++;
      return true;
    }
    return false;
  }

  // تنظيف العناصر منتهية الصلاحية
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.options.maxAge) {
        this.delete(key);
      }
    }
  }

  // بدء عملية التنظيف الدوري
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  // إيقاف عملية التنظيف الدوري
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // حساب حجم العنصر
  calculateSize(value) {
    if (value instanceof Blob) {
      return value.size;
    }
    if (value instanceof ArrayBuffer) {
      return value.byteLength;
    }
    if (typeof value === 'string') {
      return value.length * 2; // تقريبي لحجم النص في الذاكرة
    }
    return JSON.stringify(value).length * 2;
  }

  // إخلاء أقدم عنصر
  evictOldest() {
    let oldestKey = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // الحصول على إحصائيات التخزين المؤقت
  getStats() {
    return {
      ...this.stats,
      size: this.size,
      itemCount: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  // مسح التخزين المؤقت
  clear() {
    this.cache.clear();
    this.size = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }
}

// مدير التحميل المسبق
class PrefetchManager {
  constructor(cacheManager) {
    this.cacheManager = cacheManager;
    this.prefetchQueue = new Set();
    this.isProcessing = false;
  }

  // إضافة عنصر للتحميل المسبق
  async addToPrefetchQueue(key, fetchFn, priority = 'normal') {
    if (await this.cacheManager.get(key)) {
      return; // العنصر موجود بالفعل في التخزين المؤقت
    }

    const prefetchItem = {
      key,
      fetchFn,
      priority,
      timestamp: Date.now()
    };

    this.prefetchQueue.add(prefetchItem);
    
    if (!this.isProcessing) {
      this.processPrefetchQueue();
    }
  }

  // معالجة قائمة التحميل المسبق
  async processPrefetchQueue() {
    if (this.isProcessing || this.prefetchQueue.size === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // ترتيب العناصر حسب الأولوية
      const sortedItems = Array.from(this.prefetchQueue)
        .sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

      for (const item of sortedItems) {
        try {
          const value = await item.fetchFn();
          await this.cacheManager.set(item.key, value);
          this.prefetchQueue.delete(item);
        } catch (error) {
          console.error(`خطأ في التحميل المسبق للعنصر ${item.key}:`, error);
        }
      }
    } finally {
      this.isProcessing = false;

      // التحقق من وجود عناصر جديدة في القائمة
      if (this.prefetchQueue.size > 0) {
        this.processPrefetchQueue();
      }
    }
  }

  // إلغاء التحميل المسبق لعنصر
  cancelPrefetch(key) {
    for (const item of this.prefetchQueue) {
      if (item.key === key) {
        this.prefetchQueue.delete(item);
        break;
      }
    }
  }

  // مسح قائمة التحميل المسبق
  clearPrefetchQueue() {
    this.prefetchQueue.clear();
  }
}

export { CacheManager, PrefetchManager }; 