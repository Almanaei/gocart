"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Search, 
  User, 
  Heart, 
  Menu, 
  X,
  ChevronDown 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartDrawer from "@/components/CartDrawer";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount] = useState(3); // Mock cart count

  const categories = [
    { name: "Electronics", href: "#" },
    { name: "Fashion", href: "#" },
    { name: "Home & Garden", href: "#" },
    { name: "Sports", href: "#" },
    { name: "Beauty", href: "#" },
    { name: "Books", href: "#" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="hidden md:flex items-center gap-4">
              <span>🎉 Free shipping on orders over $50</span>
              <span>|</span>
              <span>📞 24/7 Customer Support</span>
            </div>
            <div className="flex items-center gap-4">
              <span>🇺🇸 USD</span>
              <span>|</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-purple-600 flex items-center gap-2">
              <span>🛍️</span>
              <span className="hidden sm:inline">ShopHub</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-700 hover:text-purple-600 font-medium">
                Categories
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category, index) => (
                  <a
                    key={index}
                    href={category.href}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Deals</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">New Arrivals</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Brands</a>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Search - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="h-5 w-5 mr-1" />
              <span className="hidden lg:inline">Account</span>
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <CartDrawer>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      className="pr-12"
                    />
                    <Button 
                      size="sm" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <nav className="space-y-4">
                    <h3 className="font-semibold text-lg">Categories</h3>
                    {categories.map((category, index) => (
                      <a
                        key={index}
                        href={category.href}
                        className="block py-2 text-gray-700 hover:text-purple-600 border-b border-gray-100"
                      >
                        {category.name}
                      </a>
                    ))}
                  </nav>

                  <nav className="space-y-4">
                    <h3 className="font-semibold text-lg">Menu</h3>
                    <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">Deals</a>
                    <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">New Arrivals</a>
                    <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">Brands</a>
                    <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">My Account</a>
                    <a href="#" className="block py-2 text-gray-700 hover:text-purple-600">Wishlist</a>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-12"
                autoFocus
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}