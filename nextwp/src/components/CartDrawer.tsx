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
  Heart,
  Loader2
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useAppStore } from "@/store";
import { useCartOperations } from "@/hooks/useProducts";
import { WooCommerceCartItem } from "@/types/wordpress";
import { toast } from "sonner";

interface CartDrawerProps {
  children: React.ReactNode;
}

export default function CartDrawer({ children }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, isLoadingCart } = useAppStore();
  const { updateCartItemQuantity, removeFromCart, isUpdatingCartItemQuantity, isRemovingFromCart } = useCartOperations();

  // Refresh cart when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Trigger cart refresh if needed
    }
  }, [isOpen]);

  const updateQuantity = async (key: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItemQuantity({ cartKey: key, quantity: newQuantity });
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
      console.error("Error updating cart quantity:", error);
    }
  };

  const removeItem = async (key: string) => {
    try {
      await removeFromCart(key);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Error removing cart item:", error);
    }
  };

  const subtotal = cart?.totals?.total_items ? parseFloat(cart.totals.total_items) : 0;
  const shipping = cart?.totals?.total_shipping ? parseFloat(cart.totals.total_shipping) : (subtotal > 50 ? 0 : 9.99);
  const tax = cart?.totals?.total_tax ? parseFloat(cart.totals.total_tax) : subtotal * 0.08;
  const total = cart?.totals?.total_price ? parseFloat(cart.totals.total_price) : subtotal + shipping + tax;

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

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
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : !cart || cart.items.length === 0 ? (
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
                {cart.items.map((item) => (
                  <div key={item.key} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.image?.src ? (
                        <img
                          src={item.image.src}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
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
                      
                      {/* Display variations if any */}
                      {item.variations && Object.keys(item.variations).length > 0 && (
                        <div className="text-sm text-gray-500 mb-2">
                          {Object.entries(item.variations).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* SKU */}
                      {item.sku && (
                        <p className="text-xs text-gray-500 mb-1">SKU: {item.sku}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-600">
                            ${parseFloat(item.price).toFixed(2)}
                          </span>
                          {item.regular_price !== item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${parseFloat(item.regular_price).toFixed(2)}
                            </span>
                          )}
                          {item.on_sale && (
                            <Badge variant="destructive" className="text-xs">
                              {Math.round(((parseFloat(item.regular_price) - parseFloat(item.price)) / parseFloat(item.regular_price)) * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.key)}
                          disabled={isRemovingFromCart}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          {isRemovingFromCart ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-600">Qty:</span>
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
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
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={isUpdatingCartItemQuantity}
                            className="h-8 w-8 p-0 rounded-l-none"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Stock status */}
                        <Badge
                          variant={item.stock_status === 'instock' ? 'default' : 'secondary'}
                          className={item.stock_status === 'instock' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {item.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                      
                      {/* Item total */}
                      <div className="mt-2 text-sm text-gray-600">
                        Item total: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cart && cart.items.length > 0 && (
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
                {cart.coupons && cart.coupons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -${cart.totals.total_discount || '0.00'}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-purple-600">
                    ${total.toFixed(2)} {cart.totals?.currency_code || 'USD'}
                  </span>
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
                  onClick={() => window.location.href = '/checkout'}
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

              {/* Payment Methods */}
              {cart.payment_methods && cart.payment_methods.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Accepted payment methods:</p>
                  <div className="flex gap-2">
                    {cart.payment_methods.slice(0, 3).map((method) => (
                      <Badge key={method.id} variant="outline" className="text-xs">
                        {method.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}