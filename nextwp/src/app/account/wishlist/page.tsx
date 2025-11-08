"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Search,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Star
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  dateAdded: string;
  salePrice?: number;
}

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      originalPrice: 399.99,
      image: "/api/placeholder/300/300",
      brand: "AudioTech",
      category: "Electronics",
      rating: 4.8,
      reviewCount: 1234,
      inStock: true,
      dateAdded: "2024-01-10",
      salePrice: 299.99
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      originalPrice: 249.99,
      image: "/api/placeholder/300/300",
      brand: "FitTech",
      category: "Electronics",
      rating: 4.6,
      reviewCount: 856,
      inStock: true,
      dateAdded: "2024-01-08",
      salePrice: 199.99
    },
    {
      id: 3,
      name: "Portable Bluetooth Speaker",
      price: 89.99,
      originalPrice: 119.99,
      image: "/api/placeholder/300/300",
      brand: "SoundWave",
      category: "Electronics",
      rating: 4.7,
      reviewCount: 567,
      inStock: false,
      dateAdded: "2024-01-05",
      salePrice: 89.99
    },
    {
      id: 4,
      name: "Wireless Charging Pad",
      price: 49.99,
      originalPrice: 69.99,
      image: "/api/placeholder/300/300",
      brand: "ChargeMate",
      category: "Electronics",
      rating: 4.5,
      reviewCount: 234,
      inStock: true,
      dateAdded: "2024-01-03",
      salePrice: 49.99
    },
    {
      id: 5,
      name: "Running Shoes",
      price: 129.99,
      image: "/api/placeholder/300/300",
      brand: "SportMax",
      category: "Sports",
      rating: 4.4,
      reviewCount: 1890,
      inStock: true,
      dateAdded: "2024-01-01"
    },
    {
      id: 6,
      name: "Cotton T-Shirt",
      price: 29.99,
      image: "/api/placeholder/300/300",
      brand: "ComfortWear",
      category: "Fashion",
      rating: 4.3,
      reviewCount: 567,
      inStock: true,
      dateAdded: "2023-12-28"
    }
  ]);

  const categories = ['all', 'Electronics', 'Sports', 'Fashion', 'Home & Garden', 'Beauty'];

  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return 0;
      }
    });

  const removeFromWishlist = (itemId: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const moveToCart = (itemId: number) => {
    // In a real app, this would call the cart service
    console.log('Moving item to cart:', itemId);
    // Remove from wishlist after adding to cart
    removeFromWishlist(itemId);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getDiscountPercentage = (item: WishlistItem) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <UserSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                  <p className="text-gray-600">
                    {wishlistItems.length} items saved for later
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search wishlist items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded">Date Added</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Wishlist Items */}
            {filteredAndSortedItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-6">Start adding items you love to your wishlist!</p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
                'space-y-4'
              }>
                {filteredAndSortedItems.map((item) => (
                  viewMode === 'grid' ? (
                    <Card key={item.id} className="group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        {/* Product Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                          <span className="text-6xl">📦</span>
                          
                          {/* Discount Badge */}
                          {getDiscountPercentage(item) > 0 && (
                            <Badge className="absolute top-2 left-2 bg-red-500">
                              -{getDiscountPercentage(item)}%
                            </Badge>
                          )}
                          
                          {/* Stock Status */}
                          {!item.inStock && (
                            <Badge className="absolute top-2 right-2 bg-red-600">
                              Out of Stock
                            </Badge>
                          )}
                          
                          {/* Quick Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFromWishlist(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">{item.brand}</p>
                            <h3 className="font-medium text-sm line-clamp-2 mb-1">
                              {item.name}
                            </h3>
                            {renderStars(item.rating)}
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-purple-600">
                              ${item.price.toFixed(2)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                              onClick={() => moveToCart(item.id)}
                              disabled={!item.inStock}
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                              <span className="text-3xl">📦</span>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm text-gray-500">{item.brand}</p>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {item.category} • Added on {new Date(item.dateAdded).toLocaleDateString()}
                                </p>
                                {renderStars(item.rating)}
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeFromWishlist(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg text-purple-600">
                                    ${item.price.toFixed(2)}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      ${item.originalPrice.toFixed(2)}
                                    </span>
                                  )}
                                  {getDiscountPercentage(item) > 0 && (
                                    <Badge className="bg-red-500">
                                      -{getDiscountPercentage(item)}%
                                    </Badge>
                                  )}
                                </div>
                                
                                {!item.inStock && (
                                  <Badge variant="destructive">Out of Stock</Badge>
                                )}
                              </div>

                              <Button 
                                size="sm" 
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => moveToCart(item.id)}
                                disabled={!item.inStock}
                              >
                                <ShoppingBag className="h-4 w-4 mr-1" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}