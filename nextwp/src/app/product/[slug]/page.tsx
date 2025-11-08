"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  CheckCircle,
  Loader2,
  Star,
  ZoomIn,
  Package,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Image from "next/image";
import { useProductBySlug, useCartOperations, useRelatedProducts } from "@/hooks/useProducts";
import { useAppStore } from "@/store";
import { WooCommerceProduct } from "@/types/wordpress";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";

// Helper function to safely render any value
const safeRender = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return JSON.stringify(value);
};

// Helper function to calculate discount percentage
const calculateDiscount = (regularPrice: number, salePrice: number): number => {
  if (regularPrice <= 0 || salePrice <= 0) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

// Helper function to format price
const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toFixed(2);
};

// Helper function to check if product is in stock
const isInStock = (product: WooCommerceProduct): boolean => {
  return product.stock_status === 'instock' && 
         (!product.manage_stock || (product.stock_quantity !== null && product.stock_quantity > 0));
};

// Helper function to get stock status message
const getStockStatusMessage = (product: WooCommerceProduct): string => {
  if (!isInStock(product)) {
    return product.stock_status === 'onbackorder' ? 'Available on backorder' : 'Out of Stock';
  }
  
  if (product.manage_stock && product.stock_quantity !== null) {
    return product.stock_quantity > 5 ? 'In Stock' : `Only ${product.stock_quantity} left`;
  }
  
  return 'In Stock';
};

// Helper function to get stock status color
const getStockStatusColor = (product: WooCommerceProduct): string => {
  if (!isInStock(product)) {
    return product.stock_status === 'onbackorder' ? 'bg-yellow-500' : 'bg-red-500';
  }
  
  if (product.manage_stock && product.stock_quantity !== null && product.stock_quantity <= 3) {
    return 'bg-orange-500';
  }
  
  return 'bg-green-500';
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent(params.slug as string);

  const { data: product, isLoading, error, refetch } = useProductBySlug(slug);
  const { addToCart, isAddingToCart } = useCartOperations();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useAppStore();
  const { data: relatedProducts } = useRelatedProducts(product?.id || 0);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setSelectedAttributes({});
  }, [product?.id]);

  // Loading state
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

  // Error state with retry functionality
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Slug: {slug}
          </p>
          <div className="space-y-3">
            <Button onClick={() => refetch()} className="bg-purple-600 hover:bg-purple-700 w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Continue Shopping
            </Button>
            <Button onClick={() => router.back()} variant="ghost" className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Product calculations
  const isOnSale = product.on_sale;
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  const salePrice = parseFloat(product.sale_price || '0');
  const displayPrice = isOnSale && salePrice > 0 ? salePrice : regularPrice;
  const discountPercentage = calculateDiscount(regularPrice, salePrice);
  const inStock = isInStock(product);
  const stockMessage = getStockStatusMessage(product);
  const stockColor = getStockStatusColor(product);

  // Handle quantity changes with stock limits
  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = product.manage_stock && product.stock_quantity ? product.stock_quantity : 99;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  // Handle attribute selection
  const handleAttributeChange = (attributeName: string, option: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: option
    }));
  };

  // Handle add to cart with better error handling
  const handleAddToCart = async () => {
    if (!product || !inStock) return;

    try {
      await addToCart(product);
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // You could show a toast notification here
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

  // Handle share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || `Check out ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  // Format product images with better error handling
  const images = product.images && product.images.length > 0 
    ? product.images.map((img, index) => ({
        id: img.id || index,
        src: img.src || '/api/placeholder/600/600', 
        name: img.name || product.name,
        alt: img.alt || `${product.name} - Image ${index + 1}`,
        width: '600',
        height: '600'
      })) 
    : [{ 
        id: 0,
        src: '/api/placeholder/600/600', 
        name: product.name, 
        alt: product.name,
        width: '600', 
        height: '600' 
      }];

  // Get product attributes
  const attributes = product.attributes || [];
  const categories = product.categories || [];

  // Render star rating
  const renderRating = () => {
    const rating = parseFloat(product.average_rating || '0');
    const ratingCount = product.rating_count || 0;
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${
                i < Math.floor(rating) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button onClick={() => router.push('/')} className="hover:text-purple-600">
            Home
          </button>
          <span>/</span>
          {categories.slice(0, 2).map((category, index) => (
            <span key={category.id}>
              <button 
                onClick={() => router.push(`/?category=${category.slug}`)}
                className="hover:text-purple-600"
              >
                {category.name}
              </button>
              {index < Math.min(categories.length - 1, 1) && <span>/</span>}
            </span>
          ))}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductGallery
              images={images}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              isZoomed={isZoomed}
              onZoomToggle={setIsZoomed}
              isOnSale={isOnSale}
              discountPercentage={discountPercentage}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Badge 
                    key={category.id} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-purple-100 hover:text-purple-800"
                    onClick={() => router.push(`/?category=${category.slug}`)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              {renderRating()}

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-purple-600">
                  ${formatPrice(displayPrice)}
                </span>
                {isOnSale && salePrice > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${formatPrice(regularPrice)}
                    </span>
                    <Badge variant="destructive" className="bg-red-500">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <div 
                  className="text-gray-600 mb-6 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: safeRender(product.short_description) }}
                />
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${stockColor}`}></div>
                <span className="text-sm font-medium">{stockMessage}</span>
                {product.manage_stock && product.stock_quantity !== null && product.stock_quantity <= 3 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Package className="h-3 w-3 mr-1" />
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Product Attributes/Variations */}
            {attributes.length > 0 && (
              <div className="space-y-4">
                {attributes.map((attribute) => (
                  <div key={attribute.id}>
                    <h3 className="font-medium mb-2">
                      {safeRender(attribute.name)}:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(attribute.options) ? (
                        attribute.options.map((option, index) => {
                          const isSelected = selectedAttributes[attribute.name] === safeRender(option);
                          return (
                            <button
                              key={index}
                              onClick={() => handleAttributeChange(attribute.name, safeRender(option))}
                              className={`px-3 py-2 border rounded-lg transition-all ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {safeRender(option)}
                            </button>
                          );
                        })
                      ) : (
                        <Badge variant="outline">
                          {safeRender(attribute.options)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0 rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={
                      product.manage_stock && 
                      product.stock_quantity !== null && 
                      quantity >= product.stock_quantity
                    }
                    className="h-10 w-10 p-0 rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {product.manage_stock && product.stock_quantity !== null && (
                  <span className="text-sm text-gray-500">
                    {product.stock_quantity} available
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock || isAddingToCart}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-lg py-3"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {inStock ? 'Add to Cart' : 'Out of Stock'}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleWishlist}
                  className={isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>

                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Success/Error Messages */}
              {showAddedToCart && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span>Added to cart successfully!</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over $50</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <RotateCcw className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.rating_count || 0})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  {product.description ? (
                    <div 
                      className="text-gray-700 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: safeRender(product.description) }}
                    />
                  ) : (
                    <p className="text-gray-500">No description available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Basic Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">SKU:</span>
                          <span className="font-medium">{product.sku || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Categories:</span>
                          <span className="font-medium">
                            {categories.map(cat => cat.name).join(', ') || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{product.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Physical Attributes */}
                    {(product.weight || product.dimensions) && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Physical Attributes</h4>
                        <div className="space-y-2">
                          {product.weight && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium">{safeRender(product.weight)} kg</span>
                            </div>
                          )}
                          {product.dimensions && (
                            <>
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Length:</span>
                                <span className="font-medium">{safeRender(product.dimensions.length)} cm</span>
                              </div>
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Width:</span>
                                <span className="font-medium">{safeRender(product.dimensions.width)} cm</span>
                              </div>
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Height:</span>
                                <span className="font-medium">{safeRender(product.dimensions.height)} cm</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Attributes */}
                  {attributes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Additional Attributes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attributes.map((attribute) => (
                          <div key={attribute.id} className="border rounded-lg p-3">
                            <h5 className="font-medium text-sm text-gray-900 mb-1">
                              {safeRender(attribute.name)}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {Array.isArray(attribute.options) 
                                ? attribute.options.join(', ')
                                : safeRender(attribute.options)
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <ProductReviews productId={product.id} />
            </TabsContent>

            <TabsContent value="shipping" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Shipping & Returns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-3">Shipping Information</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <Truck className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>Free shipping on orders over $50</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>Standard shipping: 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>Express shipping: 2-3 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>International shipping available</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Return Policy</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <RotateCcw className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>30-day return policy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>Items must be unused and in original packaging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>Refunds processed within 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span>Return shipping fees may apply</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <RelatedProducts products={relatedProducts} currentProductId={product.id} />
          </div>
        )}
      </div>
    </div>
  );
}
