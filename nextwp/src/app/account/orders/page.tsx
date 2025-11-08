"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "#1234",
      date: "2024-01-15",
      status: "completed",
      total: 329.98,
      subtotal: 319.99,
      shipping: 9.99,
      tax: 0,
      paymentMethod: "Visa ending in 4242",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "New York",
        state: "NY",
        postcode: "10001",
        country: "US"
      },
      items: [
        {
          id: 1,
          name: "Premium Wireless Headphones",
          price: 299.99,
          quantity: 1,
          image: "/api/placeholder/60/60",
          sku: "PWH-001"
        }
      ],
      trackingNumber: "1Z999AA1234567890",
      estimatedDelivery: "2024-01-20"
    },
    {
      id: "2",
      orderNumber: "#1233",
      date: "2024-01-12",
      status: "processing",
      total: 489.97,
      subtotal: 479.98,
      shipping: 9.99,
      tax: 0,
      paymentMethod: "PayPal",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "New York",
        state: "NY",
        postcode: "10001",
        country: "US"
      },
      items: [
        {
          id: 2,
          name: "Smart Fitness Watch",
          price: 199.99,
          quantity: 2,
          image: "/api/placeholder/60/60",
          sku: "SFW-002"
        },
        {
          id: 3,
          name: "Portable Bluetooth Speaker",
          price: 89.99,
          quantity: 1,
          image: "/api/placeholder/60/60",
          sku: "PBS-003"
        }
      ],
      estimatedDelivery: "2024-01-18"
    },
    {
      id: "3",
      orderNumber: "#1232",
      date: "2024-01-10",
      status: "pending",
      total: 139.98,
      subtotal: 129.99,
      shipping: 9.99,
      tax: 0,
      paymentMethod: "Bank Transfer",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "New York",
        state: "NY",
        postcode: "10001",
        country: "US"
      },
      items: [
        {
          id: 4,
          name: "Wireless Charging Pad",
          price: 49.99,
          quantity: 1,
          image: "/api/placeholder/60/60",
          sku: "WCP-004"
        },
        {
          id: 5,
          name: "Running Shoes",
          price: 129.99,
          quantity: 1,
          image: "/api/placeholder/60/60",
          sku: "RS-005"
        }
      ],
      notes: "Payment pending"
    },
    {
      id: "4",
      orderNumber: "#1231",
      date: "2024-01-08",
      status: "cancelled",
      total: 89.99,
      subtotal: 79.99,
      shipping: 10.00,
      tax: 0,
      paymentMethod: "Visa ending in 4242",
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address1: "123 Main Street",
        city: "New York",
        state: "NY",
        postcode: "10001",
        country: "US"
      },
      items: [
        {
          id: 6,
          name: "Cotton T-Shirt",
          price: 29.99,
          quantity: 3,
          image: "/api/placeholder/60/60",
          sku: "CT-006"
        }
      ],
      notes: "Customer requested cancellation"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    const orderDate = new Date(order.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (dateFilter) {
      case 'today':
        matchesDate = daysDiff === 0;
        break;
      case 'week':
        matchesDate = daysDiff <= 7;
        break;
      case 'month':
        matchesDate = daysDiff <= 30;
        break;
      case 'year':
        matchesDate = daysDiff <= 365;
        break;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      case 'refunded': return <RefreshCw className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const reorderItems = (orderItems: OrderItem[]) => {
    // In a real app, this would add items to cart
    console.log('Reordering items:', orderItems);
  };

  const trackOrder = (trackingNumber: string) => {
    // In a real app, this would open tracking page
    console.log('Tracking order:', trackingNumber);
  };

  const downloadInvoice = (orderId: string) => {
    // In a real app, this would download invoice
    console.log('Downloading invoice for order:', orderId);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
              <p className="text-gray-600">
                Track and manage all your orders in one place
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={() => {setSearchTerm(''); setStatusFilter('all'); setDateFilter('all');}}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex-shrink-0 w-20">
                              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-2xl">📦</span>
                              </div>
                              <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Shipping Address</p>
                          <p className="text-gray-600">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                            {order.shippingAddress.address1}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postcode}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Payment Method</p>
                          <p className="text-gray-600">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Order Details</p>
                          <p className="text-gray-600">
                            Subtotal: ${order.subtotal.toFixed(2)}<br />
                            Shipping: ${order.shipping.toFixed(2)}<br />
                            Tax: ${order.tax.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {order.trackingNumber && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => trackOrder(order.trackingNumber)}
                              className="text-blue-600 hover:text-blue-700 ml-auto"
                            >
                              Track
                            </Button>
                          </div>
                          {order.estimatedDelivery && (
                            <p className="text-sm text-blue-600 mt-1">
                              Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Note:</span> {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {order.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => reorderItems(order.items)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                        )}
                        {order.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadInvoice(order.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Invoice
                          </Button>
                        )}
                        {order.trackingNumber && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => trackOrder(order.trackingNumber)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Info */}
                <div>
                  <h3 className="font-semibold mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-medium">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-4">Shipping Address</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Recipient</p>
                      <p className="font-medium">
                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {selectedOrder.shippingAddress.address1}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postcode}<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                {selectedOrder.status === 'completed' && (
                  <Button onClick={() => reorderItems(selectedOrder.items)}>
                    Reorder Items
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}