"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Heart, 
  Star,
  Loader2,
  Eye
} from "lucide-react";
import Image from "next/image";
import { WooCommerceProduct } from "@/types/wordpress";
import { useCartOperations } from "@/hooks/useProducts";
import { useAppStore } from "@/store";

interface RelatedProductsProps {
  products: WooCommerceProduct[];
  currentProductId: number;
}

export default function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
  const router = useRouter();
  const { addToCart, isAddingToCart } = useCartOperations();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useAppStore();

  const handleAddToCart = async (product: WooCommerceProduct) => {
    try {
      await addToCart({ productId: product.id, quantity: 1 });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const isInStock = (product: WooCommerceProduct): boolean => {
    return product.stock_status === 'instock' && 
           (!product.manage_stock || (product.stock_quantity !== null && product.stock_quantity > 0));
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating || '0');
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${
              i < Math.floor(numRating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">({numRating.toFixed(1)})</span>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: WooCommerceProduct }) => {
    const isOnSale = product.on_sale;
    const regularPrice = parseFloat(product.regular_price || product.price || '0');
    const salePrice = parseFloat(product.sale_price || '0');
    const displayPrice = isOnSale && salePrice > 0 ? salePrice : regularPrice;
    const inStock = isInStock(product);

    const imageUrl = product.images && product.images.length > 0 
      ? product.images[0].src 
      : '/api/placeholder/300/300';

    return (
      <Card className="group hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          {/* Product Image */}
          <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Sale Badge */}
            {isOnSale && (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                Sale
              </Badge>
            )}

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleWishlist(product.id)}
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isInWishlist(product.id) ? 'fill-current text-red-500' : ''
                  }`} 
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/product/${product.slug}`)}
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.categories.slice(0, 2).map((category) => (
                  <Badge 
                    key={category.id} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Product Name */}
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/product/${product.slug}`)}>
              {product.name}
            </h3>

            {/* Rating */}
            {product.average_rating && parseFloat(product.average_rating) > 0 && (
              <div className="flex items-center">
                {renderStars(product.average_rating)}
                {product.rating_count > 0 && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({product.rating_count})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-600">
                ${formatPrice(displayPrice)}
              </span>
              {isOnSale && salePrice > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ${formatPrice(regularPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                inStock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-600">
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={!inStock || isAddingToCart}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-3 w-3" />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Filter out the current product and limit to 8 related products
  const relatedProducts = products
    .filter(p => p.id !== currentProductId)
    .slice(0, 8);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Products</h2>
        <p className="text-gray-600">Customers who viewed this item also viewed</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="border-purple-600 text-purple-600 hover:bg-purple-50"
        >
          View All Products
        </Button>
      </div>
    </div>
  );
}
