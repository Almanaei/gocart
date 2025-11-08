"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronDown, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { WooCommerceProduct } from "@/types/wordpress";

interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  onSale: boolean;
  sortBy: string;
  categories: string[];
  attributes: Record<string, string[]>;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
    onSale: false,
    sortBy: 'relevance',
    categories: [],
    attributes: {},
  });

  const { data: products, isLoading, error } = useProducts({
    search: filters.query,
    category: filters.category,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    stock_status: filters.inStock ? 'instock' : undefined,
    on_sale: filters.onSale ? true : undefined,
    orderby: filters.sortBy === 'price_low' ? 'price' : 
             filters.sortBy === 'price_high' ? 'price' :
             filters.sortBy === 'rating' ? 'rating' :
             filters.sortBy === 'date' ? 'date' : 'popularity',
    order: filters.sortBy === 'price_low' || filters.sortBy === 'date' ? 'asc' : 'desc',
  });

  // Extract unique categories from products
  const availableCategories = useMemo(() => {
    if (!products) return [];
    const categories = new Set<string>();
    products.forEach(product => {
      product.categories?.forEach(cat => categories.add(cat.name));
    });
    return Array.from(categories).sort();
  }, [products]);

  // Extract price range from products
  const priceRange = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => parseFloat(p.price || '0')).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 1000 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      const price = parseFloat(product.price || '0');
      
      // Category filter
      if (filters.categories.length > 0) {
        const productCategories = product.categories?.map(cat => cat.name) || [];
        if (!filters.categories.some(cat => productCategories.includes(cat))) {
          return false;
        }
      }
      
      // Price filter
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }
      
      // Stock filter
      if (filters.inStock && product.stock_status !== 'instock') {
        return false;
      }
      
      // Sale filter
      if (filters.onSale && !product.on_sale) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      category: '',
      minPrice: 0,
      maxPrice: 1000,
      inStock: false,
      onSale: false,
      sortBy: 'relevance',
      categories: [],
      attributes: {},
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.inStock,
    filters.onSale,
    filters.categories.length > 0,
    filters.minPrice > 0,
    filters.maxPrice < 1000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10 pr-4 py-2 text-lg"
              />
              {filters.query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('query', '')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
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

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.category && (
                <Badge variant="default" className="flex items-center gap-1">
                  Category: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('category', '')}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="default" className="flex items-center gap-1">
                  In Stock
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('inStock', false)}
                  />
                </Badge>
              )}
              {filters.onSale && (
                <Badge variant="default" className="flex items-center gap-1">
                  On Sale
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('onSale', false)}
                  />
                </Badge>
              )}
              {filters.categories.map(cat => (
                <Badge key={cat} variant="default" className="flex items-center gap-1">
                  {cat}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('categories', filters.categories.filter(c => c !== cat))}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear
                    </Button>
                  </div>

                  <Accordion type="multiple" defaultValue={['categories', 'price', 'availability']} className="space-y-4">
                    {/* Categories */}
                    <AccordionItem value="categories">
                      <AccordionTrigger className="text-left">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {availableCategories.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category}`}
                                checked={filters.categories.includes(category)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateFilter('categories', [...filters.categories, category]);
                                  } else {
                                    updateFilter('categories', filters.categories.filter(c => c !== category));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`category-${category}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Price Range */}
                    <AccordionItem value="price">
                      <AccordionTrigger className="text-left">
                        Price Range
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              ${filters.minPrice} - ${filters.maxPrice}
                            </span>
                          </div>
                          <Slider
                            value={[filters.minPrice, filters.maxPrice]}
                            onValueChange={([min, max]) => {
                              updateFilter('minPrice', min);
                              updateFilter('maxPrice', max);
                            }}
                            min={priceRange.min}
                            max={priceRange.max}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filters.minPrice}
                              onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                              className="w-full"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filters.maxPrice}
                              onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 1000)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Availability */}
                    <AccordionItem value="availability">
                      <AccordionTrigger className="text-left">
                        Availability
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="in-stock"
                              checked={filters.inStock}
                              onCheckedChange={(checked) => updateFilter('inStock', !!checked)}
                            />
                            <label 
                              htmlFor="in-stock"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              In Stock Only
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="on-sale"
                              checked={filters.onSale}
                              onCheckedChange={(checked) => updateFilter('onSale', !!checked)}
                            />
                            <label 
                              htmlFor="on-sale"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              On Sale
                            </label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {filters.query ? `Search results for "${filters.query}"` : 'All Products'}
                </h1>
                <p className="text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              
              {/* Sort */}
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="date">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading products. Please try again.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <ProductGrid 
                products={filteredProducts} 
                viewMode={viewMode}
                className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
