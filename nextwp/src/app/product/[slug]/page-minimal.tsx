
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
  CheckCircle,
  Loader2,
  Star
} from "lucide-react";
import Image from "next/image";
import { useProductBySlug, useCartOperations } from "@/hooks/useProducts";
import { useAppStore } from "@/store";
import { WooCommerceProduct } from "@/types/wordpress";

// Helper function to safely render any value
const safeRender = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return JSON.stringify(value);
};

export default function MinimalProductPage() {
  const params = useParams();
  const router = useRouter();
  // Decode the slug to handle special characters
  const slug = decodeURIComponent(params.slug as string);

  const { data: product, isLoading, error } = useProductBySlug(slug);
  const { addToCart, isAddingToCart } = useCartOperations();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useAppStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddedToCart, setShowAddedToCart] = useState(false);

  // If product is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // If product not found or error
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-light mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-8 space-y-3">
            <Button onClick={() => router.push('/')} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-none">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full rounded-none border-gray-300">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    const success = await addToCart(product, quantity);
    if (success) {
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    }
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

  // Check if product is on sale
  const isOnSale = product.on_sale;

  // Get regular and sale prices
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  const salePrice = parseFloat(product.sale_price || '0');
  const displayPrice = isOnSale && salePrice > 0 ? salePrice : regularPrice;

  // Get product attributes
  const attributes = product.attributes || [];

  // Get product categories
  const categories = product.categories || [];

  // Format product images
  const images = product.images && product.images.length > 0
    ? product.images.map(img => ({
        src: img.src || '/api/placeholder/600/600',
        name: img.name || product.name,
        // Handle dimensions properly
        width: typeof img.width === 'object' ? img.width?.toString() : img.width,
        height: typeof img.height === 'object' ? img.height?.toString() : img.height
      }))
    : [{ src: '/api/placeholder/600/600', name: product.name, width: '600', height: '600' }];

  // Mock reviews for display purposes
  const reviews = [
    { id: 1, name: "Alex Johnson", rating: 5, comment: "Absolutely love this product! The quality is exceptional." },
    { id: 2, name: "Sarah Williams", rating: 4, comment: "Great design and functionality. Highly recommend." },
    { id: 3, name: "Michael Chen", rating: 5, comment: "Exceeded my expectations. Worth every penny." }
  ];

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              <Image
                src={images[selectedImageIndex]?.src || '/api/placeholder/600/600'}
                alt={images[selectedImageIndex]?.name || product.name}
                fill
                className="object-contain"
                priority
              />
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs uppercase tracking-wider">
                  Sale
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 border ${
                      selectedImageIndex === index ? 'border-gray-900' : 'border-gray-200'
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
          <div className="space-y-8">
            <div>
              {/* Breadcrumb/Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => router.push(`/?category=${category.slug}`)}
                    className="text-xs text-gray-500 hover:text-gray-900 uppercase tracking-wider"
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex text-amber-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-light text-gray-900">
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
                  className="text-gray-600 mb-8 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: safeRender(product.short_description) }}
                />

              )}

              {/* Availability */}
              <div className="flex items-center mb-8">
                <div className={`w-2 h-2 rounded-full mr-2 ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {product.in_stock ? 'In stock' : 'Out of stock'}
                </span>
                {product.stock_quantity && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({safeRender(product.stock_quantity)} units available)
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Variations/Attributes */}
            {attributes.length > 0 && (
              <div className="space-y-6">
                {attributes.map((attribute) => (
                  <div key={attribute.id}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{safeRender(attribute.name)}</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(attribute.options) ? (
                        attribute.options.map((option, index) => (
                          <button
                            key={index}
                            className="px-4 py-2 border border-gray-200 text-sm hover:border-gray-900 focus:outline-none"
                          >
                            {safeRender(option)}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 border border-gray-200 text-sm">
                          {safeRender(attribute.options)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-900 mr-6">Quantity</span>
                <div className="flex items-center border rounded-none">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-1 text-sm w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isAddingToCart}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-none h-12"
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
                  onClick={toggleWishlist}
                  className={`h-12 w-12 rounded-none flex items-center justify-center ${
                    isInWishlist(product.id) ? 'text-red-500 border-red-500' : 'border-gray-300'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>

                <Button variant="outline" className="h-12 w-12 rounded-none flex items-center justify-center border-gray-300">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Added to cart notification */}
              {showAddedToCart && (
                <div className="flex items-center gap-2 text-green-600 px-0">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Added to cart</span>
                </div>
              )}
            </div>

            {/* Full Description */}
            {product.description && (
              <div className="pt-6">
                <div className="h-px bg-gray-100 mb-8"></div>
                <div
                  className="text-gray-600 text-sm leading-relaxed max-w-none"
                  dangerouslySetInnerHTML={{ __html: safeRender(product.description) }}
                />
              </div>
            )}

            {/* Reviews */}
            <div className="pt-6">
              <div className="h-px bg-gray-100 mb-8"></div>

              <div className="mb-8">
                <h2 className="text-xl font-light mb-4">Customer Reviews</h2>

                <div className="flex items-center mb-6">
                  <div className="text-4xl font-light mr-4">{averageRating.toFixed(1)}</div>
                  <div>
                    <div className="flex text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Based on {reviews.length} reviews</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-sm mr-3">{review.name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
