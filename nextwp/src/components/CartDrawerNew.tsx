"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Heart
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useAppStore } from "@/store";
import { useCartOperations } from "@/hooks/useProducts";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { WooCommerceCartItem } from "@/types/wordpress";

interface CartDrawerProps {
  children: React.ReactNode;
}

export default function CartDrawer({ children }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Get cart state from the store
  const { cart, cartItems, isLoadingCart } = useAppStore();

  // Get cart operations
  const { 
    updateCartItemQuantity, 
    removeFromCart,
    isUpdatingCartItemQuantity,
    isRemovingFromCart
  } = useCartOperations();

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="w-full sm:max-w-md">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DrawerHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart ({totalItems} items)
              </DrawerTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoadingCart ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">Loading cart...</div>
              </div>
            ) : !cartItems || cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to your cart to see them here</p>
                <Button onClick={() => setIsOpen(false)} className="bg-purple-600 hover:bg-purple-700">
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item: WooCommerceCartItem) => (
                  <div key={item.key} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.name}
                      </h4>
                      {item.attributes && item.attributes.length > 0 && (
                        <div className="text-sm text-gray-500 mb-1">
                          {item.attributes.map((attr, index) => (
                            <span key={index}>
                              {attr.name}: {attr.option}
                              {index < item.attributes.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-600">
                            ${parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.key)}
                          disabled={isRemovingFromCart}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-600">Qty:</span>
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartItemQuantity(item.key, item.quantity - 1)}
                            disabled={isUpdatingCartItemQuantity || item.quantity <= 1}
                            className="h-8 w-8 p-0 rounded-r-none"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartItemQuantity(item.key, item.quantity + 1)}
                            disabled={isUpdatingCartItemQuantity}
                            className="h-8 w-8 p-0 rounded-l-none"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cartItems && cartItems.length > 0 && (
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-purple-600">${total.toFixed(2)}</span>
                </div>
                {shipping === 0 && subtotal < 50 && (
                  <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    Add ${(50 - subtotal).toFixed(2)} more to qualify for FREE shipping!
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  size="lg"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/checkout");
                  }}
                >
                  Proceed to Checkout
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Wishlist & Save for Later */}
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  <Heart className="h-4 w-4 mr-1" />
                  Save for Later
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
