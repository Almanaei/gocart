"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Database,
  Globe,
  AlertTriangle,
  Eye,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: any[];
  syncStatus: {
    lastSync: string;
    status: 'success' | 'error' | 'syncing';
    productsSynced: number;
    totalProducts: number;
  };
  systemHealth: {
    wordpress: 'healthy' | 'error' | 'warning';
    database: 'healthy' | 'error' | 'warning';
    cache: 'healthy' | 'error' | 'warning';
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch WordPress health
      const healthResponse = await fetch('/api/wordpress/health');
      const healthData = await healthResponse.json();
      
      // Fetch orders (mock data for now)
      const ordersResponse = await fetch('/api/orders');
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : [];
      
      // Mock stats calculation
      const mockStats: DashboardStats = {
        totalProducts: healthData.products?.total || 0,
        totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
        totalRevenue: 15420.50, // Mock revenue
        totalCustomers: 234, // Mock customers
        recentOrders: Array.isArray(ordersData) ? ordersData.slice(0, 5) : [],
        syncStatus: {
          lastSync: new Date().toISOString(),
          status: healthData.wordpress?.status === 'connected' ? 'success' : 'error',
          productsSynced: healthData.products?.total || 0,
          totalProducts: healthData.products?.total || 0,
        },
        systemHealth: {
          wordpress: healthData.wordpress?.status === 'connected' ? 'healthy' : 'error',
          database: 'healthy', // Mock
          cache: 'healthy', // Mock
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleSyncProducts = async () => {
    try {
      setRefreshing(true);
      // This would trigger a product sync
      toast({
        title: "Sync Started",
        description: "Product synchronization has been initiated",
      });
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock sync
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize products",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      syncing: 'outline',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Error</h1>
            <p className="text-gray-600">Failed to load dashboard data</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleSyncProducts}
                disabled={refreshing}
              >
                <Database className="h-4 w-4 mr-2" />
                Sync Products
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.syncStatus.productsSynced} synced
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="sync">Sync Status</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentOrders.map((order, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id || index + 1}</p>
                            <p className="text-sm text-gray-500">
                              {order.customer_name || 'Guest Customer'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.total || '0.00'}</p>
                            <p className="text-sm text-gray-500">
                              {order.status || 'pending'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent orders</p>
                  )}
                </CardContent>
              </Card>

              {/* Sync Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Sync Progress</CardTitle>
                  <CardDescription>WordPress synchronization status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Products</span>
                      <span className="text-sm text-gray-500">
                        {stats.syncStatus.productsSynced} / {stats.syncStatus.totalProducts}
                      </span>
                    </div>
                    <Progress 
                      value={(stats.syncStatus.productsSynced / stats.syncStatus.totalProducts) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Sync</span>
                    <span className="text-sm text-gray-500">
                      {new Date(stats.syncStatus.lastSync).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    {getStatusBadge(stats.syncStatus.status)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>Manage customer orders and fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentOrders.map((order, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">#{order.id || index + 1}</TableCell>
                          <TableCell>{order.customer_name || 'Guest'}</TableCell>
                          <TableCell>${order.total || '0.00'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status || 'pending'}</Badge>
                          </TableCell>
                          <TableCell>
                            {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-8">No orders found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>WordPress Sync Status</CardTitle>
                <CardDescription>Monitor synchronization with WordPress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.syncStatus.productsSynced}
                    </div>
                    <p className="text-sm text-gray-500">Products Synced</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.syncStatus.totalProducts}
                    </div>
                    <p className="text-sm text-gray-500">Total Products</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round((stats.syncStatus.productsSynced / stats.syncStatus.totalProducts) * 100)}%
                    </div>
                    <p className="text-sm text-gray-500">Sync Progress</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Last Synchronization</p>
                    <p className="text-sm text-gray-500">
                      {new Date(stats.syncStatus.lastSync).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(stats.syncStatus.status)}
                    <Button size="sm" onClick={handleSyncProducts}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system components and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">WordPress Connection</p>
                        <p className="text-sm text-gray-500">API connectivity and authentication</p>
                      </div>
                    </div>
                    {getStatusBadge(stats.systemHealth.wordpress)}
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Database</p>
                        <p className="text-sm text-gray-500">Local database connectivity</p>
                      </div>
                    </div>
                    {getStatusBadge(stats.systemHealth.database)}
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Cache System</p>
                        <p className="text-sm text-gray-500">Performance and caching</p>
                      </div>
                    </div>
                    {getStatusBadge(stats.systemHealth.cache)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
