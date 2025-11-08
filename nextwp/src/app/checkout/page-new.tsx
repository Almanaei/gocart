"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard, Truck, MapPin, Shield, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useAppStore } from "@/store";
import { useCartOperations } from "@/hooks/useProducts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WooCommerceCartItem } from "@/types/wordpress";

interface CheckoutForm {
  // Customer Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Billing Address
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingPostcode: string;
  billingCountry: string;

  // Shipping Address
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostcode: string;
  shippingCountry: string;

  // Payment
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;

  // Additional
  notes: string;
  shippingDifferent: boolean;
  createAccount: boolean;
  password: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartItems, isLoadingCart } = useAppStore();
  const { removeFromCart, updateCartItemQuantity, isUpdatingCartItemQuantity, isRemovingFromCart } = useCartOperations();

  const [activeStep, setActiveStep] = useState<'cart' | 'shipping' | 'payment' | 'review'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CheckoutForm>({
    // Customer Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Billing Address
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingPostcode: '',
    billingCountry: 'US',

    // Shipping Address
    shippingAddress1: '',
    shippingAddress2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostcode: '',
    shippingCountry: 'US',

    // Payment
    paymentMethod: 'stripe',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',

    // Additional
    notes: '',
    shippingDifferent: false,
    createAccount: false,
    password: ''
  });

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) || 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        payment_method: formData.paymentMethod,
        payment_method_title: formData.paymentMethod === 'stripe' ? 'Credit Card' : 'Cash on Delivery',
        set_paid: false,
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.billingAddress1,
          address_2: formData.billingAddress2,
          city: formData.billingCity,
          state: formData.billingState,
          postcode: formData.billingPostcode,
          country: formData.billingCountry,
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.shippingDifferent ? formData.shippingAddress1 : formData.billingAddress1,
          address_2: formData.shippingDifferent ? formData.shippingAddress2 : formData.billingAddress2,
          city: formData.shippingDifferent ? formData.shippingCity : formData.billingCity,
          state: formData.shippingDifferent ? formData.shippingState : formData.billingState,
          postcode: formData.shippingDifferent ? formData.shippingPostcode : formData.billingPostcode,
          country: formData.shippingDifferent ? formData.shippingCountry : formData.billingCountry,
        },
        line_items: cartItems?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        customer_note: formData.notes
      };

      // In a real implementation, you would call your API to create the order
      // For now, we'll simulate a successful order creation
      setTimeout(() => {
        setOrderId(Math.floor(Math.random() * 10000) + 1000);
        setOrderComplete(true);
        setIsSubmitting(false);
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      setIsSubmitting(false);
    }
  };

  // If order is complete, show success message
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Complete!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order number is <span className="font-semibold">#{orderId}</span>.
            </p>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to {formData.email}.
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => router.push('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          {[
            { id: 'cart', label: 'Cart', icon: ShoppingCart },
            { id: 'shipping', label: 'Shipping', icon: Truck },
            { id: 'payment', label: 'Payment', icon: CreditCard },
            { id: 'review', label: 'Review', icon: CheckCircle }
          ].map((step, index, array) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center ${activeStep === step.id ? 'text-purple-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${activeStep === step.id ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {index < array.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${index < array.findIndex(s => s.id === activeStep) ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Cart Step */}
            {activeStep === 'cart' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shopping Cart ({cartItems?.length || 0} items)</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCart ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : !cartItems || cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                      <p className="text-gray-500 mb-6">Add some products to your cart to continue</p>
                      <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700">
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item: WooCommerceCartItem) => (
                        <div key={item.key} className="flex gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                          {item.image ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-3xl">📦</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            {item.attributes && item.attributes.length > 0 && (
                              <div className="text-sm text-gray-600 mb-1">
                                {item.attributes.map((attr, index) => (
                                  <span key={index}>
                                    {attr.name}: {attr.option}
                                    {index < item.attributes.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateCartItemQuantity(item.key, item.quantity - 1)}
                                  disabled={isUpdatingCartItemQuantity || item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="px-3 py-1">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateCartItemQuantity(item.key, item.quantity + 1)}
                                  disabled={isUpdatingCartItemQuantity}
                                >
                                  +
                                </Button>
                              </div>
                              <span className="font-bold text-purple-600">
                                ${parseFloat(item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => removeFromCart(item.key)}
                            disabled={isRemovingFromCart}
                            className="text-red-600"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={() => router.push('/')}>
                          Continue Shopping
                        </Button>
                        <Button onClick={() => setActiveStep('shipping')}>
                          Proceed to Shipping
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Shipping Step */}
            {activeStep === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingAddress1">Billing Address</Label>
                    <Input
                      id="billingAddress1"
                      value={formData.billingAddress1}
                      onChange={(e) => handleInputChange('billingAddress1', e.target.value)}
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      value={formData.billingAddress2}
                      onChange={(e) => handleInputChange('billingAddress2', e.target.value)}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        value={formData.billingCity}
                        onChange={(e) => handleInputChange('billingCity', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        value={formData.billingState}
                        onChange={(e) => handleInputChange('billingState', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingPostcode">ZIP Code</Label>
                      <Input
                        id="billingPostcode"
                        value={formData.billingPostcode}
                        onChange={(e) => handleInputChange('billingPostcode', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="shippingDifferent"
                      checked={formData.shippingDifferent}
                      onCheckedChange={(checked) => handleInputChange('shippingDifferent', checked as boolean)}
                    />
                    <Label htmlFor="shippingDifferent">Ship to a different address</Label>
                  </div>

                  {formData.shippingDifferent && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <h3 className="font-medium">Shipping Address</h3>

                      <div>
                        <Label htmlFor="shippingAddress1">Address</Label>
                        <Input
                          id="shippingAddress1"
                          value={formData.shippingAddress1}
                          onChange={(e) => handleInputChange('shippingAddress1', e.target.value)}
                          placeholder="Street address"
                          required
                        />
                      </div>

                      <div>
                        <Input
                          value={formData.shippingAddress2}
                          onChange={(e) => handleInputChange('shippingAddress2', e.target.value)}
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="shippingCity">City</Label>
                          <Input
                            id="shippingCity"
                            value={formData.shippingCity}
                            onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingState">State</Label>
                          <Input
                            id="shippingState"
                            value={formData.shippingState}
                            onChange={(e) => handleInputChange('shippingState', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingPostcode">ZIP Code</Label>
                          <Input
                            id="shippingPostcode"
                            value={formData.shippingPostcode}
                            onChange={(e) => handleInputChange('shippingPostcode', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveStep('cart')}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Return to Cart
                    </Button>
                    <Button onClick={() => setActiveStep('payment')}>
                      Continue to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Step */}
            {activeStep === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.paymentMethod === 'stripe' && (
                    <div className="space-y-4 border rounded-lg p-4">
                      <h3 className="font-medium">Credit Card Information</h3>

                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value)}
                          placeholder="John Smith"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4" />
                        <span>Your payment information is encrypted and secure</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Special instructions for your order"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createAccount"
                      checked={formData.createAccount}
                      onCheckedChange={(checked) => handleInputChange('createAccount', checked as boolean)}
                    />
                    <Label htmlFor="createAccount">Create an account for future purchases</Label>
                  </div>

                  {formData.createAccount && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Create a password"
                        required={formData.createAccount}
                      />
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveStep('shipping')}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Return to Shipping
                    </Button>
                    <Button onClick={() => setActiveStep('review')}>
                      Review Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Step */}
            {activeStep === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Items in your order</h3>
                    <div className="space-y-4">
                      {cartItems?.map((item: WooCommerceCartItem) => (
                        <div key={item.key} className="flex items-center gap-4">
                          {item.image ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">📦</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Qty: {item.quantity}</span>
                              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Shipping Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p>
                        {formData.shippingDifferent ? formData.shippingAddress1 : formData.billingAddress1}
                        {formData.shippingDifferent && formData.shippingAddress2 && `, ${formData.shippingAddress2}`}
                        {!formData.shippingDifferent && formData.billingAddress2 && `, ${formData.billingAddress2}`}
                      </p>
                      <p>
                        {formData.shippingDifferent ? formData.shippingCity : formData.billingCity}, {formData.shippingDifferent ? formData.shippingState : formData.billingState} {formData.shippingDifferent ? formData.shippingPostcode : formData.billingPostcode}
                      </p>
                      <p className="mt-2">{formData.email}</p>
                      {formData.phone && <p>{formData.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {formData.paymentMethod === 'stripe' ? (
                        <div>
                          <p>Credit Card ending in {formData.cardNumber.slice(-4)}</p>
                          <p className="text-sm text-gray-600">Name on card: {formData.cardName}</p>
                        </div>
                      ) : (
                        <p>Cash on Delivery</p>
                      )}
                    </div>
                  </div>

                  {formData.notes && (
                    <div>
                      <h3 className="font-medium mb-2">Order Notes</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{formData.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setActiveStep('payment')}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Return to Payment
                    </Button>
                    <Button 
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && subtotal < 50 && (
                  <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mt-4">
                    Add ${(50 - subtotal).toFixed(2)} more to qualify for FREE shipping!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
