"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Loader2
} from "lucide-react";
import Image from "next/image";
import { useProductBySlug, useCartOperations } from "@/hooks/useProducts";
import { useAppStore } from "@/store";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent(params.slug as string);

  const { data: product, isLoading, error } = useProductBySlug(slug);
  const { addToCart, isAddingToCart } = useCartOperations();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useAppStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Helper function to safely render any value
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return JSON.stringify(value);
  };

  // If product is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // If product not found
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700 w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
  };

  // Handle wishlist toggle
  const toggleWishlist = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  // Get product prices
  const isOnSale = product.on_sale;
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  const salePrice = parseFloat(product.sale_price || '0');
  const displayPrice = isOnSale && salePrice > 0 ? salePrice : regularPrice;

  // Get product categories
  const categories = product.categories || [];

  // Format product images
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => ({
        src: img.src || '/api/placeholder/600/600', 
        name: img.name || product.name,
        width: typeof img.width === 'object' ? img.width?.toString() : img.width,
        height: typeof img.height === 'object' ? img.height?.toString() : img.height
      })) 
    : [{ src: '/api/placeholder/600/600', name: product.name, width: '600', height: '600' }];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <Image
                src={images[selectedImageIndex]?.src || '/api/placeholder/600/600'}
                alt={images[selectedImageIndex]?.name || product.name}
                fill
                className="object-contain"
              />
              {isOnSale && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                  Sale
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      selectedImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.src || '/api/placeholder/80/80'}
                      alt={image.name || `Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Breadcrumb/Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Badge 
                    key={category.id} 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => router.push(`/?category=${category.slug}`)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-purple-600">
                  ${displayPrice.toFixed(2)}
                </span>
                {isOnSale && salePrice > 0 && (
                  <span className="text-lg text-gray-500 line-through">
                    ${regularPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <div 
                  className="text-gray-600 mb-6"
                  dangerouslySetInnerHTML={{ __html: safeRender(product.short_description) }}
                />
              )}

              {/* Availability */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.stock_quantity && (
                  <span className="text-sm text-gray-500">
                    ({safeRender(product.stock_quantity)} available)
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0 rounded-r-none"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0 rounded-l-none"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isAddingToCart}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleWishlist}
                  className={isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>

                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Product Details */}
            {product.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <div 
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: safeRender(product.description) }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
