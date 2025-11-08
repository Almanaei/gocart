"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export function LazyComponent({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className = "",
}: LazyComponentProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasLoaded]);

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );

  return (
    <div ref={containerRef} className={className}>
      {isInView ? (
        <Suspense fallback={fallback || defaultFallback}>
          {children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

// Higher-order component for lazy loading
export function lazyLoad<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = (props: T) => {
    return (
      <LazyComponent fallback={fallback}>
        <Suspense fallback={fallback || <div>Loading...</div>}>
          {React.createElement(
            React.lazy(importFunc),
            props
          )}
        </Suspense>
      </LazyComponent>
    );
  };

  LazyComponent.displayName = `LazyLoad(${importFunc.name || 'Component'})`;
  
  return LazyComponent;
}

// Specific lazy components for heavy parts of the application
export const LazyProductGallery = lazyLoad(
  () => import("@/components/ProductGallery"),
  <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
);

export const LazyProductReviews = lazyLoad(
  () => import("@/components/ProductReviews"),
  <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
);

export const LazyRelatedProducts = lazyLoad(
  () => import("@/components/RelatedProducts"),
  <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
);
