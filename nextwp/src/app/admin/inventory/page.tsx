"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  RefreshCw,
  BarChart3,
  Warehouse,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  description: string;
  image: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  location: string;
  supplier: string;
  reorderPoint: number;
  reorderQuantity: number;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: Array<{
    name: string;
    count: number;
    value: number;
  }>;
  topSelling: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  stockMovements: Array<{
    id: string;
    productId: string;
    productName: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
    timestamp: string;
    userId: string;
  }>;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Widget",
    sku: "PW-001",
    category: "Electronics",
    price: 199.99,
    stock: 45,
    lowStockThreshold: 20,
    status: "in_stock",
    description: "High-quality electronic widget with advanced features",
    image: "/images/products/premium-widget.jpg",
    weight: 0.5,
    dimensions: { length: 10, width: 5, height: 2 },
    location: "Warehouse A",
    supplier: "TechSupplier Inc.",
    reorderPoint: 30,
    reorderQuantity: 50,
    lastRestocked: "2025-01-08T10:30:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-10T14:25:00Z",
  },
  {
    id: "2",
    name: "Standard Widget",
    sku: "SW-002",
    category: "Electronics",
    price: 149.99,
    stock: 123,
    lowStockThreshold: 25,
    status: "in_stock",
    description: "Standard quality widget with essential features",
    image: "/images/products/standard-widget.jpg",
    weight: 0.3,
    dimensions: { length: 8, width: 4, height: 2 },
    location: "Warehouse A",
    supplier: "TechSupplier Inc.",
    reorderPoint: 40,
    reorderQuantity: 75,
    lastRestocked: "2025-01-05T09:15:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-12T11:40:00Z",
  },
  {
    id: "3",
    name: "Basic Widget",
    sku: "BW-003",
    category: "Electronics",
    price: 99.99,
    stock: 234,
    lowStockThreshold: 30,
    status: "in_stock",
    description: "Basic widget with core functionality",
    image: "/images/products/basic-widget.jpg",
    weight: 0.2,
    dimensions: { length: 6, width: 3, height: 1 },
    location: "Warehouse B",
    supplier: "BasicTech Corp",
    reorderPoint: 50,
    reorderQuantity: 100,
    lastRestocked: "2025-01-03T16:20:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-15T10:10:00Z",
  },
  {
    id: "4",
    name: "Deluxe Widget",
    sku: "DW-004",
    category: "Electronics",
    price: 299.99,
    stock: 12,
    lowStockThreshold: 10,
    status: "low_stock",
    description: "Deluxe widget with premium features and materials",
    image: "/images/products/deluxe-widget.jpg",
    weight: 0.7,
    dimensions: { length: 12, width: 6, height: 3 },
    location: "Warehouse A",
    supplier: "TechSupplier Inc.",
    reorderPoint: 15,
    reorderQuantity: 25,
    lastRestocked: "2025-01-07T13:45:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-18T15:30:00Z",
  },
  {
    id: "5",
    name: "Pro Widget",
    sku: "PR-005",
    category: "Electronics",
    price: 399.99,
    stock: 8,
    lowStockThreshold: 5,
    status: "low_stock",
    description: "Professional widget with enterprise-grade features",
    image: "/images/products/pro-widget.jpg",
    weight: 0.8,
    dimensions: { length: 15, width: 7, height: 4 },
    location: "Warehouse C",
    supplier: "ProTech Solutions",
    reorderPoint: 10,
    reorderQuantity: 20,
    lastRestocked: "2025-01-06T11:30:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-20T12:15:00Z",
  },
  {
    id: "6",
    name: "Mega Widget",
    sku: "MW-006",
    category: "Electronics",
    price: 499.99,
    stock: 3,
    lowStockThreshold: 3,
    status: "low_stock",
    description: "Mega widget with maximum features and capabilities",
    image: "/images/products/mega-widget.jpg",
    weight: 1.0,
    dimensions: { length: 18, width: 8, height: 5 },
    location: "Warehouse C",
    supplier: "ProTech Solutions",
    reorderPoint: 5,
    reorderQuantity: 15,
    lastRestocked: "2025-01-04T10:20:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-22T14:45:00Z",
  },
  {
    id: "7",
    name: "Vintage Widget",
    sku: "VW-007",
    category: "Collectibles",
    price: 249.99,
    stock: 0,
    lowStockThreshold: 2,
    status: "out_of_stock",
    description: "Vintage collectible widget - limited edition",
    image: "/images/products/vintage-widget.jpg",
    weight: 0.4,
    dimensions: { length: 8, width: 4, height: 2 },
    location: "Warehouse B",
    supplier: "Collectibles Co",
    reorderPoint: 5,
    reorderQuantity: 10,
    lastRestocked: "2024-12-15T09:30:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-25T16:20:00Z",
  },
  {
    id: "8",
    name: "Mini Widget",
    sku: "MW-008",
    category: "Electronics",
    price: 79.99,
    stock: 156,
    lowStockThreshold: 20,
    status: "in_stock",
    description: "Compact mini widget for portable use",
    image: "/images/products/mini-widget.jpg",
    weight: 0.1,
    dimensions: { length: 4, width: 2, height: 1 },
    location: "Warehouse A",
    supplier: "TechSupplier Inc.",
    reorderPoint: 30,
    reorderQuantity: 60,
    lastRestocked: "2025-01-09T14:10:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-17T11:25:00Z",
  },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
  });
  const { toast } = useToast();

  const categories = Array.from(new Set(products.map(p => p.category)));
  const locations = Array.from(new Set(products.map(p => p.location)));

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(product => product.location === selectedLocation);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedLocation]);

  useEffect(() => {
    const inventoryStats: InventoryStats = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      lowStockItems: products.filter(p => p.status === 'low_stock').length,
      outOfStockItems: products.filter(p => p.status === 'out_of_stock').length,
      categories: categories.map(category => ({
        name: category,
        count: products.filter(p => p.category === category).length,
        value: products
          .filter(p => p.category === category)
          .reduce((sum, p) => sum + (p.price * p.stock), 0),
      })),
      topSelling: products
        .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          sales: p.stock,
          revenue: p.price * p.stock,
        })),
      stockMovements: [],
    };

    setStats(inventoryStats);
  }, [products]);

  const handleStockAdjustment = async (productId: string) => {
    try {
      setLoading(true);
      
      // Mock stock adjustment
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) return;

      const updatedProducts = [...products];
      const product = updatedProducts[productIndex];
      
      if (stockAdjustment.type === 'in') {
        product.stock += stockAdjustment.quantity;
        product.lastRestocked = new Date().toISOString();
      } else if (stockAdjustment.type === 'out') {
        product.stock = Math.max(0, product.stock - stockAdjustment.quantity);
      } else {
        product.stock = Math.max(0, product.stock + stockAdjustment.quantity);
      }

      // Update status based on stock level
      if (product.stock === 0) {
        product.status = 'out_of_stock';
      } else if (product.stock <= product.lowStockThreshold) {
        product.status = 'low_stock';
      } else {
        product.status = 'in_stock';
      }

      product.updatedAt = new Date().toISOString();
      updatedProducts[productIndex] = product;
      setProducts(updatedProducts);

      toast({
        title: "Stock Updated",
        description: `Stock has been ${stockAdjustment.type === 'in' ? 'increased' : stockAdjustment.type === 'out' ? 'decreased' : 'adjusted'} for ${product.name}`,
      });

      setIsStockDialogOpen(false);
      setStockAdjustment({ type: 'in', quantity: 0, reason: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      case 'discontinued':
        return <Badge className="bg-gray-100 text-gray-800">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalInventoryValue = () => {
    return products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  };

  const getStockLevel = (product: Product) => {
    const percentage = (product.stock / product.lowStockThreshold) * 100;
    if (percentage >= 100) return 'high';
    if (percentage >= 50) return 'medium';
    if (percentage > 0) return 'low';
    return 'critical';
  };

  const getStockLevelColor = (product: Product) => {
    const level = getStockLevel(product);
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Warehouse className="h-6 w-6 mr-3 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{categories.length}</span> categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalValue || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Across all inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.lowStockItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                Items below threshold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.outOfStockItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                Items unavailable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>Manage and monitor your product inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 md:w-80"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getStockLevelColor(product)}`}>
                            {product.stock}
                          </span>
                          <span className="text-sm text-gray-500">
                            / {product.lowStockThreshold}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsStockDialogOpen(true);
                              }}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                // Handle delete
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct && !isEditDialogOpen && !isStockDialogOpen} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Product details and inventory information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">SKU</h4>
                    <p className="text-sm">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="text-sm">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Price</h4>
                    <p className="text-sm">{formatCurrency(selectedProduct.price)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Stock Level</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`font-medium ${getStockLevelColor(selectedProduct)}`}>
                        {selectedProduct.stock} units
                      </span>
                      <span className="text-sm text-gray-500">
                        (Threshold: {selectedProduct.lowStockThreshold})
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-sm">{selectedProduct.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Supplier</h4>
                    <p className="text-sm">{selectedProduct.supplier}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Restocked</h4>
                    <p className="text-sm">{formatDate(selectedProduct.lastRestocked)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
              <p className="text-sm">{selectedProduct.description}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {isEditDialogOpen && selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  value={selectedProduct.name}
                  onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={selectedProduct.sku}
                  onChange={(e) => setSelectedProduct({...selectedProduct, sku: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={selectedProduct.price}
                  onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  value={selectedProduct.stock}
                  onChange={(e) => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <Input
                  type="number"
                  value={selectedProduct.lowStockThreshold}
                  onChange={(e) => setSelectedProduct({...selectedProduct, lowStockThreshold: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Handle save
                  setIsEditDialogOpen(false);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stock Adjustment Dialog */}
      {isStockDialogOpen && selectedProduct && (
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
              <DialogDescription>
                Update inventory for {selectedProduct.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Stock</label>
                <p className="text-lg font-medium">{selectedProduct.stock} units</p>
              </div>
              <div>
                <label className="text-sm font-medium">Adjustment Type</label>
                <Select value={stockAdjustment.type} onValueChange={(value: 'in' | 'out' | 'adjustment') => setStockAdjustment({...stockAdjustment, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Input
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleStockAdjustment(selectedProduct.id)}
                  disabled={loading || stockAdjustment.quantity === 0}
                >
                  {loading ? 'Processing...' : 'Adjust Stock'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
