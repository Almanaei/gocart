"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartOperations } from "@/hooks/useProducts";
import { useAppStore } from "@/store";
import { WooCommerceProduct } from "@/types/wordpress";

interface ProductGridProps {
  products: WooCommerceProduct[];
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ProductGrid({ products, viewMode = 'grid', className = '' }: ProductGridProps) {
  const { addToCart, isAddingToCart } = useCartOperations();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useAppStore();
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (productId: number) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  const handleAddToCart = async (product: WooCommerceProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_status !== 'instock') return;
    
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = (product: WooCommerceProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const renderRating = (product: WooCommerceProduct) => {
    const rating = parseFloat(product.average_rating || '0');
    const ratingCount = product.rating_count || 0;
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${
                i < Math.floor(rating) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          ))}
        </div>
        {ratingCount > 0 && (
          <span className="text-xs text-gray-500">({ratingCount})</span>
        )}
      </div>
    );
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const getProductImage = (product: WooCommerceProduct) => {
    if (imageErrors.has(product.id)) {
      return '/api/placeholder/300/300';
    }
    
    const image = product.images?.[0];
    return image?.src || '/api/placeholder/300/300';
  };

  const getProductPricing = (product: WooCommerceProduct) => {
    const isOutOfStock = product.stock_status !== 'instock';
    const isOnSale = product.on_sale;
    const regularPrice = parseFloat(product.regular_price || product.price || '0');
    const salePrice = parseFloat(product.sale_price || '0');
    const displayPrice = isOnSale && salePrice > 0 ? salePrice : regularPrice;
    const discountPercentage = isOnSale && salePrice > 0 
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) 
      : 0;

    return {
      isOutOfStock,
      isOnSale,
      regularPrice,
      salePrice,
      displayPrice,
      discountPercentage
    };
  };

  if (viewMode === 'list') {
    return (
      <div className={className}>
        {products.map((product) => {
          const pricing = getProductPricing(product);
          return (
            <Card key={product.id} className="mb-4 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Link href={`/product/${product.slug}`}>
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                        onError={() => handleImageError(product.id)}
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {pricing.isOnSale && pricing.discountPercentage > 0 && (
                        <Badge variant="destructive" className="bg-red-500">
                          {pricing.discountPercentage}% OFF
                        </Badge>
                      )}
                      {pricing.isOutOfStock && (
                        <Badge variant="secondary">Out of Stock</Badge>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <Link href={`/product/${product.slug}`}>
                          <h3 className="text-lg font-semibold hover:text-purple-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.categories?.slice(0, 3).map((category) => (
                            <Badge key={category.id} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleToggleWishlist(product, e)}
                          className={isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    {product.short_description && (
                      <p 
                        className="text-gray-600 text-sm mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: product.short_description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                        }}
                      />
                    )}

                    {/* Rating */}
                    {renderRating(product)}

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-purple-600">
                          ${formatPrice(pricing.displayPrice)}
                        </span>
                        {pricing.isOnSale && pricing.salePrice > 0 && (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              ${formatPrice(pricing.regularPrice)}
                            </span>
                          </>
                        )}
                      </div>

                      <Button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={pricing.isOutOfStock || isAddingToCart}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isAddingToCart ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {pricing.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Grid View
  return (
    <div className={className}>
      {products.map((product) => {
        const pricing = getProductPricing(product);
        return (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/product/${product.slug}`}>
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(product.id)}
                  />
                </Link>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={isInWishlist(product.id) ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Link href={`/product/${product.slug}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {pricing.isOnSale && pricing.discountPercentage > 0 && (
                    <Badge variant="destructive" className="bg-red-500">
                      {pricing.discountPercentage}% OFF
                    </Badge>
                  )}
                  {pricing.isOutOfStock && (
                    <Badge variant="secondary">Out of Stock</Badge>
                  )}
                </div>

                {/* Stock Status Indicator */}
                <div className="absolute bottom-2 left-2">
                  {product.stock_status === 'instock' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Package className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.categories?.slice(0, 2).map((category) => (
                    <Badge key={category.id} variant="outline" className="text-xs">
                      {category.name}
                    </Badge>
                  ))}
                </div>

                {/* Product Name */}
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                {renderRating(product)}

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-purple-600">
                    ${formatPrice(pricing.displayPrice)}
                  </span>
                  {pricing.isOnSale && pricing.salePrice > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      ${formatPrice(pricing.regularPrice)}
                    </span>
                  )}
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={pricing.isOutOfStock || isAddingToCart}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {pricing.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
