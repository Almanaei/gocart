"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'banned';
  registeredAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  tags: string[];
  notes?: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCustomers: Customer[];
  customerGrowth: Array<{
    month: string;
    customers: number;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Mock data - in production, this would fetch from your API
      const mockCustomers: Customer[] = [
        {
          id: "1",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "+1-555-0123",
          address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zip: "10001",
            country: "USA"
          },
          status: "active",
          registeredAt: "2024-01-15T10:00:00Z",
          lastLoginAt: "2025-01-09T15:30:00Z",
          totalOrders: 12,
          totalSpent: 2450.50,
          averageOrderValue: 204.21,
          loyaltyTier: "gold",
          tags: ["vip", "repeat-customer"],
          notes: "Prefers premium products, responds well to discounts"
        },
        {
          id: "2",
          email: "jane.smith@example.com",
          firstName: "Jane",
          lastName: "Smith",
          phone: "+1-555-0124",
          status: "active",
          registeredAt: "2024-03-20T14:30:00Z",
          lastLoginAt: "2025-01-10T09:15:00Z",
          totalOrders: 8,
          totalSpent: 1250.00,
          averageOrderValue: 156.25,
          loyaltyTier: "silver",
          tags: ["new-customer"]
        },
        {
          id: "3",
          email: "mike.wilson@example.com",
          firstName: "Mike",
          lastName: "Wilson",
          status: "inactive",
          registeredAt: "2023-12-10T08:45:00Z",
          lastLoginAt: "2024-11-20T16:00:00Z",
          totalOrders: 3,
          totalSpent: 450.75,
          averageOrderValue: 150.25,
          loyaltyTier: "bronze",
          tags: ["dormant"]
        }
      ];
      
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      // Mock stats data
      const mockStats: CustomerStats = {
        totalCustomers: 1247,
        activeCustomers: 892,
        newCustomersThisMonth: 45,
        totalRevenue: 125420.50,
        averageOrderValue: 156.75,
        topCustomers: [],
        customerGrowth: [
          { month: "2024-08", customers: 980 },
          { month: "2024-09", customers: 1050 },
          { month: "2024-10", customers: 1120 },
          { month: "2024-11", customers: 1180 },
          { month: "2024-12", customers: 1202 },
          { month: "2025-01", customers: 1247 },
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesTier = tierFilter === "all" || customer.loyaltyTier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const updateCustomerStatus = async (customerId: string, status: Customer['status']) => {
    try {
      // In production, this would call your API
      setCustomers(prev => 
        prev.map(c => c.id === customerId ? { ...c, status } : c)
      );
      
      toast({
        title: "Customer Updated",
        description: `Customer status has been updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const exportCustomers = () => {
    // In production, this would generate and download a CSV/Excel file
    const csv = [
      ["ID", "Name", "Email", "Status", "Orders", "Total Spent", "Loyalty Tier"],
      ...filteredCustomers.map(c => [
        c.id,
        `${c.firstName} ${c.lastName}`,
        c.email,
        c.status,
        c.totalOrders.toString(),
        c.totalSpent.toString(),
        c.loyaltyTier
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Customer data has been exported",
    });
  };

  const getStatusBadge = (status: Customer['status']) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      banned: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {status === 'active' && <CheckCircle className="h-3 w-3" />}
        {status === 'inactive' && <XCircle className="h-3 w-3" />}
        {status === 'banned' && <Ban className="h-3 w-3" />}
        {status}
      </Badge>
    );
  };

  const getLoyaltyBadge = (tier: Customer['loyaltyTier']) => {
    const colors = {
      bronze: "bg-orange-100 text-orange-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[tier]}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <Users className="h-6 w-6 mr-3 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Customer Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCustomers}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newCustomersThisMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCustomers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}% of total
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
                  From all customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averageOrderValue}</div>
                <p className="text-xs text-muted-foreground">
                  Per customer
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Loyalty Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            <CardDescription>Manage your customer database</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Loyalty</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {customer.address.city}, {customer.address.state}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>{getLoyaltyBadge(customer.loyaltyTier)}</TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{customer.totalOrders}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${customer.totalSpent.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        Avg: ${customer.averageOrderValue.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(customer.registeredAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {customer.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCustomerStatus(customer.id, 'inactive')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCustomerStatus(customer.id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Customer Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer && `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
              </DialogTitle>
              <DialogDescription>
                Customer details and order history
              </DialogDescription>
            </DialogHeader>
            
            {selectedCustomer && (
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{selectedCustomer.email}</span>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{selectedCustomer.phone}</span>
                          </div>
                        )}
                        {selectedCustomer.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>
                              {selectedCustomer.address.street}<br />
                              {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zip}<br />
                              {selectedCustomer.address.country}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Customer Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Orders:</span>
                          <span className="font-medium">{selectedCustomer.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Spent:</span>
                          <span className="font-medium">${selectedCustomer.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Order Value:</span>
                          <span className="font-medium">${selectedCustomer.averageOrderValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loyalty Tier:</span>
                          {getLoyaltyBadge(selectedCustomer.loyaltyTier)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedCustomer.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedCustomer.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedCustomer.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{selectedCustomer.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>Recent orders from this customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 text-center py-8">
                        Order history will be displayed here
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Activity</CardTitle>
                      <CardDescription>Recent customer interactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Registered: {new Date(selectedCustomer.registeredAt).toLocaleDateString()}</span>
                        </div>
                        {selectedCustomer.lastLoginAt && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <span>Last Login: {new Date(selectedCustomer.lastLoginAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
