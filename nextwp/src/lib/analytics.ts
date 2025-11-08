import React from 'react';

// Comprehensive analytics and monitoring system

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
}

interface PageViewEvent extends AnalyticsEvent {
  event: 'page_view';
  properties: {
    title: string;
    path: string;
    referrer?: string;
    search?: string;
  };
}

interface UserEvent extends AnalyticsEvent {
  event: 'user_action';
  properties: {
    action: string;
    category: string;
    label?: string;
    value?: number;
  };
}

interface PerformanceEvent extends AnalyticsEvent {
  event: 'performance';
  properties: {
    metric: string;
    value: number;
    navigationType?: string;
  };
}

interface ErrorEvent extends AnalyticsEvent {
  event: 'error';
  properties: {
    message: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    errorId?: string;
  };
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private isInitialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private maxQueueSize = 100;
  private flushInterval = 10000; // 10 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private apiEndpoint: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.apiEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics';
    
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    if (this.isInitialized) return;

    // Load user ID from storage
    this.loadUserId();

    // Set up page tracking
    this.trackPageView();

    // Set up error tracking
    this.setupErrorTracking();

    // Set up performance tracking
    this.setupPerformanceTracking();

    // Start flush timer
    this.startFlushTimer();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }

    this.isInitialized = true;
  }

  private loadUserId(): void {
    if (typeof window !== 'undefined') {
      // Try to get user ID from multiple sources
      this.userId = 
        localStorage.getItem('analytics_user_id') ||
        sessionStorage.getItem('analytics_user_id') ||
        null;
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_user_id', userId);
      sessionStorage.setItem('analytics_user_id', userId);
    }
  }

  public clearUserId(): void {
    this.userId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_user_id');
      sessionStorage.removeItem('analytics_user_id');
    }
  }

  private createEvent(event: string, properties: Record<string, any>): AnalyticsEvent {
    return {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };
  }

  public track(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent = this.createEvent(event, properties);
    this.addToQueue(analyticsEvent);
  }

  public trackPageView(): void {
    if (typeof window === 'undefined') return;

    const pageViewEvent: PageViewEvent = {
      event: 'page_view',
      properties: {
        title: document.title,
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        search: window.location.search || undefined,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
    };

    this.addToQueue(pageViewEvent);
  }

  public trackUserAction(action: string, category: string, label?: string, value?: number): void {
    const userEvent: UserEvent = {
      event: 'user_action',
      properties: {
        action,
        category,
        label,
        value,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };

    this.addToQueue(userEvent);
  }

  public trackPerformance(metric: string, value: number, navigationType?: string): void {
    const performanceEvent: PerformanceEvent = {
      event: 'performance',
      properties: {
        metric,
        value,
        navigationType,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };

    this.addToQueue(performanceEvent);
  }

  public trackError(error: Error, errorId?: string): void {
    const errorEvent: ErrorEvent = {
      event: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        filename: (error as any).filename,
        lineno: (error as any).lineno,
        colno: (error as any).colno,
        errorId,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };

    this.addToQueue(errorEvent);
  }

  private addToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(isSync = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (isSync && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // Use sendBeacon for synchronous requests (page unload)
        navigator.sendBeacon(
          this.apiEndpoint,
          JSON.stringify({ events: eventsToSend })
        );
      } else {
        // Regular async request
        await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: eventsToSend }),
          keepalive: isSync,
        });
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      
      // Re-queue events if flush failed
      if (!isSync) {
        this.eventQueue.unshift(...eventsToSend);
      }
    }
  }

  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(
        new Error(event.message),
        `js_error_${Date.now()}`
      );
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        `promise_rejection_${Date.now()}`
      );
    });
  }

  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Track Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackPerformance('lcp', Math.round(lastEntry.startTime));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              this.trackPerformance('fid', Math.round((entry as any).processingStart - entry.startTime));
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });
          this.trackPerformance('cls', Math.round(clsValue * 1000) / 1000);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Track Time to First Byte (TTFB)
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackPerformance('ttfb', Math.round(navEntry.responseStart - navEntry.requestStart));
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.error('Error setting up performance observers:', error);
      }
    }

    // Track page load time
    window.addEventListener('load', () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        this.trackPerformance('page_load_time', loadTime);
      }
    });
  }

  // E-commerce specific tracking
  public trackProductView(productId: number, productName: string, price: number, category?: string): void {
    this.track('product_view', {
      product_id: productId,
      product_name: productName,
      price,
      category,
    });
  }

  public trackAddToCart(productId: number, productName: string, price: number, quantity: number = 1): void {
    this.track('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      value: price * quantity,
    });
  }

  public trackRemoveFromCart(productId: number, productName: string, price: number, quantity: number = 1): void {
    this.track('remove_from_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      value: price * quantity,
    });
  }

  public trackPurchase(orderId: string, total: number, items: Array<{
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
  }>): void {
    this.track('purchase', {
      order_id: orderId,
      total,
      items,
      value: total,
    });
  }

  public trackSearch(query: string, resultCount: number, filters?: Record<string, any>): void {
    this.track('search', {
      query,
      result_count: resultCount,
      filters,
    });
  }

  // Custom event tracking
  public trackCustom(eventName: string, properties: Record<string, any>): void {
    this.track(eventName, properties);
  }

  // Get analytics data (for admin/dashboard)
  public async getAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    events?: string[];
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('start_date', filters.startDate.toISOString());
      if (filters?.endDate) params.append('end_date', filters.endDate.toISOString());
      if (filters?.events) params.append('events', filters.events.join(','));

      const response = await fetch(`${this.apiEndpoint}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  // Debug methods
  public getEventQueue(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  // Cleanup
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackProductView: analytics.trackProductView.bind(analytics),
    trackAddToCart: analytics.trackAddToCart.bind(analytics),
    trackRemoveFromCart: analytics.trackRemoveFromCart.bind(analytics),
    trackPurchase: analytics.trackPurchase.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackCustom: analytics.trackCustom.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
  };
}

// HOC for automatically tracking page views
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
 pageTitle?: string
) {
  return function TrackedComponent(props: P) {
    React.useEffect(() => {
      if (pageTitle) {
        document.title = pageTitle;
      }
      analytics.trackPageView();
    }, []);

    return React.createElement(Component, props);
  };
}

// Performance monitoring utilities
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  analytics.trackPerformance(name, Math.round(end - start));
  
  return result;
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  analytics.trackPerformance(name, Math.round(end - start));
  
  return result;
}