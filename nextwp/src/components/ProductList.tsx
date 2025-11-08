"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  SlidersHorizontal,
  Grid,
  List,
  Filter,
  X
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  category: string;
  brand: string;
  inStock: boolean;
}

interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRanges: string[];
  ratings: string[];
}

export default function ProductList() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: '',
    rating: '',
    inStock: false
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions: FilterOptions = {
    categories: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books'],
    brands: ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Puma', 'Under Armour'],
    priceRanges: ['Under $25', '$25 - $50', '$50 - $100', '$100 - $200', 'Over $200'],
    ratings: ['4+ Stars', '3+ Stars', '2+ Stars']
  };

  const products: Product[] = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 299.99,
      originalPrice: 399.99,
      image: "/api/placeholder/300/300",
      rating: 4.8,
      reviewCount: 1234,
      badge: "Best Seller",
      category: "Electronics",
      brand: "Apple",
      inStock: true
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      originalPrice: 249.99,
      image: "/api/placeholder/300/300",
      rating: 4.6,
      reviewCount: 856,
      badge: "New",
      category: "Electronics",
      brand: "Samsung",
      inStock: true
    },
    {
      id: 3,
      name: "Portable Bluetooth Speaker",
      price: 89.99,
      originalPrice: 119.99,
      image: "/api/placeholder/300/300",
      rating: 4.7,
      reviewCount: 567,
      badge: "Sale",
      category: "Electronics",
      brand: "Sony",
      inStock: true
    },
    {
      id: 4,
      name: "Wireless Charging Pad",
      price: 49.99,
      originalPrice: 69.99,
      image: "/api/placeholder/300/300",
      rating: 4.5,
      reviewCount: 234,
      badge: "Hot",
      category: "Electronics",
      brand: "LG",
      inStock: false
    },
    {
      id: 5,
      name: "Running Shoes",
      price: 129.99,
      image: "/api/placeholder/300/300",
      rating: 4.4,
      reviewCount: 1890,
      category: "Sports",
      brand: "Nike",
      inStock: true
    },
    {
      id: 6,
      name: "Cotton T-Shirt",
      price: 29.99,
      image: "/api/placeholder/300/300",
      rating: 4.3,
      reviewCount: 567,
      category: "Fashion",
      brand: "Adidas",
      inStock: true
    },
    {
      id: 7,
      name: "Yoga Mat",
      price: 39.99,
      image: "/api/placeholder/300/300",
      rating: 4.6,
      reviewCount: 445,
      category: "Sports",
      brand: "Puma",
      inStock: true
    },
    {
      id: 8,
      name: "Skincare Set",
      price: 79.99,
      originalPrice: 99.99,
      image: "/api/placeholder/300/300",
      rating: 4.8,
      reviewCount: 334,
      badge: "Luxury",
      category: "Beauty",
      brand: "LG",
      inStock: true
    }
  ];

  const handleFilterChange = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: type === 'categories' || type === 'brands' 
        ? prev[type].includes(value)
          ? prev[type].filter(item => item !== value)
          : [...prev[type], value]
        : value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      brands: [],
      priceRange: '',
      rating: '',
      inStock: false
    });
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Apply filters
    if (selectedFilters.categories.length > 0) {
      filtered = filtered.filter(product => 
        selectedFilters.categories.includes(product.category)
      );
    }

    if (selectedFilters.brands.length > 0) {
      filtered = filtered.filter(product => 
        selectedFilters.brands.includes(product.brand)
      );
    }

    if (selectedFilters.inStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.reverse();
        break;
      default:
        // Featured - keep original order
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <div className="text-6xl">📦</div>
        </div>
        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-purple-600">
            {product.badge}
          </Badge>
        )}
        {!product.inStock && (
          <Badge className="absolute top-3 left-3 bg-red-600">
            Out of Stock
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
        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-purple-600">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );

  const ProductListRow = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <div className="text-3xl">📦</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand} • {product.category}</p>
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">({product.reviewCount})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-purple-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.badge && (
                  <Badge className="bg-purple-600 mb-2">{product.badge}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Discover our wide range of products</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
          <div className="bg-white rounded-lg border p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700"
              >
                Clear All
              </Button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                {filterOptions.categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.categories.includes(category)}
                      onChange={(e) => handleFilterChange('categories', category)}
                      className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Brands</h4>
              <div className="space-y-2">
                {filterOptions.brands.slice(0, 6).map((brand) => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.brands.includes(brand)}
                      onChange={(e) => handleFilterChange('brands', brand)}
                      className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="space-y-2">
                {filterOptions.priceRanges.map((range) => (
                  <label key={range} className="flex items-center">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedFilters.priceRange === range}
                      onChange={(e) => handleFilterChange('priceRange', range)}
                      className="mr-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">{range}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Customer Rating</h4>
              <div className="space-y-2">
                {filterOptions.ratings.map((rating) => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedFilters.rating === rating}
                      onChange={(e) => handleFilterChange('rating', rating)}
                      className="mr-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">{rating}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                  className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {/* Results Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductListRow key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="default">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">...</Button>
              <Button variant="outline">10</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}