
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wcService, searchProducts } from '@/lib/wordpress-api';
import { WooCommerceProduct } from '@/types/wordpress';

// Fetch all products
export function useProducts(params?: any) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => wcService.getProducts(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch a single product by ID
export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => wcService.getProduct(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch a single product by slug
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => wcService.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 60 * 1000, // 1 minute
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  });
}

// Fetch featured products
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => wcService.getProducts({ featured: true, per_page: 8 }),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch products by category
export function useProductsByCategory(categoryId: number, params?: any) {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => wcService.getProducts({ category: categoryId, ...params }),
    enabled: !!categoryId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Search products
export function useSearchProducts(query: string, params?: any) {
  return useQuery({
    queryKey: ['products', 'search', query, params],
    queryFn: () => searchProducts(query, params),
    enabled: !!query,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch product categories
export function useProductCategories(params?: any) {
  return useQuery({
    queryKey: ['product-categories', params],
    queryFn: () => wcService.getProductCategories(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch related products
export function useRelatedProducts(productId: number) {
  return useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: async () => {
      // First get the product to find its related products
      const product = await wcService.getProduct(productId);
      if (!product.related_ids || product.related_ids.length === 0) {
        return [];
      }

      // Then fetch the related products
      return Promise.all(product.related_ids.map(id => wcService.getProduct(id)));
    },
    enabled: !!productId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Create a custom hook for managing cart operations
export function useCartOperations() {
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (productOrId: WooCommerceProduct | { productId: number; quantity?: number }) => {
      const { useAppStore } = await import('@/store');
      const { addToCart } = useAppStore.getState();
      
      // Handle both product object and object with productId format
      if ('id' in productOrId) {
        // It's a WooCommerceProduct object
        return addToCart(productOrId, 1);
      } else {
        // It's an object with productId - we need to fetch the product first
        const { wcService } = await import('@/lib/wordpress-api');
        const product = await wcService.getProduct(productOrId.productId);
        if (product) {
          return addToCart(product, productOrId.quantity || 1);
        }
        throw new Error('Product not found');
      }
    },
    onSuccess: () => {
      // Invalidate cart queries to refetch updated cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartKey: string) => {
      const { useAppStore } = await import('@/store');
      const { removeFromCart } = useAppStore.getState();
      return removeFromCart(cartKey);
    },
    onSuccess: () => {
      // Invalidate cart queries to refetch updated cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateCartItemQuantityMutation = useMutation({
    mutationFn: async ({ cartKey, quantity }: { cartKey: string, quantity: number }) => {
      const { useAppStore } = await import('@/store');
      const { updateCartItemQuantity } = useAppStore.getState();
      return updateCartItemQuantity(cartKey, quantity);
    },
    onSuccess: () => {
      // Invalidate cart queries to refetch updated cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    addToCart: addToCartMutation.mutate,
    addToCartAsync: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,

    removeFromCart: removeFromCartMutation.mutate,
    removeFromCartAsync: removeFromCartMutation.mutateAsync,
    isRemovingFromCart: removeFromCartMutation.isPending,

    updateCartItemQuantity: updateCartItemQuantityMutation.mutate,
    updateCartItemQuantityAsync: updateCartItemQuantityMutation.mutateAsync,
    isUpdatingCartItemQuantity: updateCartItemQuantityMutation.isPending,
  };
}
