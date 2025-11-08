"use client";

import React, { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Heart, ArrowRight } from "lucide-react";
import { useFeaturedProducts, useProductCategories } from "@/hooks/useProducts";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingProducts } = useFeaturedProducts();
  const { data: categories, isLoading: isLoadingCategories } = useProductCategories({ per_page: 6 });

  // Function to render product stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">({rating})</span>
      </div>
    );
  };

  // Function to render loading skeleton for products
  const renderProductSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="relative">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="absolute top-3 left-3 h-6 w-20" />
        <Skeleton className="absolute top-3 right-3 h-8 w-8 rounded-full" />
      </div>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4" />
            ))}
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );

  // Function to render loading skeleton for categories
  const renderCategorySkeleton = () => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6 text-center space-y-3">
        <Skeleton className="h-12 w-12 mx-auto rounded-full" />
        <Skeleton className="h-5 w-20 mx-auto" />
        <Skeleton className="h-4 w-10 mx-auto" />
      </CardContent>
    </Card>
  );


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  New Collection 2024
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Discover Amazing
                  <span className="text-yellow-300"> Products</span>
                </h1>
                <p className="text-xl md:text-2xl text-purple-100">
                  Shop the latest trends with unbeatable prices and quality
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 text-lg px-8 py-4">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4">
                  View Collection
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h3 className="text-2xl font-bold mb-2">Special Offer</h3>
                  <p className="text-purple-100 mb-4">Get up to 50% off on selected items</p>
                  <div className="text-3xl font-bold text-yellow-300">50% OFF</div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Browse our wide range of products across different categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {isLoadingCategories ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>{renderCategorySkeleton()}</div>
              ))
            ) : (
              categories?.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                      {category.image && (
                        <div className="h-12 w-12 mb-3 mx-auto overflow-hidden rounded-lg">
                          <img 
                            src={category.image.src} 
                            alt={category.name}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.count} items</p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
        </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              Handpicked selection of our most popular items
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>{renderProductSkeleton()}</div>
              ))
            ) : (
              featuredProducts?.map((product) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="relative">
                    <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center cursor-pointer">
                      <ProductImage
                        src={product.images[0]?.src}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fill={true}
                      />
                    </div>
                  </Link>
                  {product.on_sale && (
                    <Badge className="absolute top-3 left-3 bg-red-600">
                      Sale
                    </Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(Number(product.average_rating) || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({Number(product.average_rating) || 0})</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-600">
                        ${product.price}
                      </span>
                      {product.regular_price && product.price !== product.regular_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.regular_price}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  </CardContent>
                </Card>
              ))
            )}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="px-8 py-3">
            View All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-purple-100 mb-8 text-lg">
              Subscribe to our newsletter and get exclusive offers and updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Button className="bg-yellow-400 text-purple-900 hover:bg-yellow-300 px-6 py-3">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}