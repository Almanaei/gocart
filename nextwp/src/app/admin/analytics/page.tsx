"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Eye,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  MousePointer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    averageOrderValue: number;
    totalProducts: number;
    pageViews: number;
    bounceRate: number;
  };
  revenue: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  sales: Array<{
    date: string;
    sales: number;
    target: number;
    product: string;
  }>;
  products: Array<{
    name: string;
    sales: number;
    revenue: number;
    views: number;
    conversionRate: number;
    stock: number;
  }>;
  customers: Array<{
    date: string;
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
  }>;
  traffic: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  }>;
  topPages: Array<{
    url: string;
    pageViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>;
  conversionFunnel: Array<{
    stage: string;
    users: number;
    conversionRate: number;
    dropOffRate: number;
  }>;
}

const COLORS = {
  primary: "#9333ea",
  secondary: "#10b981",
  tertiary: "#f59e0b",
  quaternary: "#ef4444",
  quinary: "#8b5cf6",
  purple: "#a855f7",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  orange: "#f97316",
  pink: "#ec4899",
  gray: "#6b7280",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data - in production, this would fetch from your analytics API
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 284750.50,
          totalOrders: 1247,
          totalCustomers: 892,
          conversionRate: 3.2,
          averageOrderValue: 228.35,
          totalProducts: 156,
          pageViews: 45230,
          bounceRate: 42.3,
        },
        revenue: [
          { date: subDays(new Date(), 30).toISOString(), revenue: 12450.75, orders: 523, customers: 412 },
          { date: subDays(new Date(), 29).toISOString(), revenue: 11890.25, orders: 498, customers: 389 },
          { date: subDays(new Date(), 28).toISOString(), revenue: 13240.80, orders: 567, customers: 445 },
          { date: subDays(new Date(), 27).toISOString(), revenue: 10980.15, orders: 445, customers: 367 },
          { date: subDays(new Date(), 26).toISOString(), revenue: 11520.30, orders: 489, customers: 401 },
          { date: subDays(new Date(), 25).toISOString(), revenue: 12870.45, orders: 534, customers: 423 },
          { date: subDays(new Date(), 24).toISOString(), revenue: 9870.20, orders: 412, customers: 345 },
          { date: subDays(new Date(), 23).toISOString(), revenue: 11230.60, orders: 467, customers: 389 },
          { date: subDays(new Date(), 22).toISOString(), revenue: 10560.35, orders: 445, customers: 367 },
          { date: subDays(new Date(), 21).toISOString(), revenue: 12340.70, orders: 512, customers: 423 },
          { date: subDays(new Date(), 20).toISOString(), revenue: 11890.25, orders: 498, customers: 389 },
          { date: subDays(new Date(), 19).toISOString(), revenue: 13450.80, orders: 567, customers: 445 },
          { date: subDays(new Date(), 18).toISOString(), revenue: 10980.15, orders: 445, customers: 367 },
          { date: subDays(new Date(), 17).toISOString(), revenue: 11520.30, orders: 489, customers: 401 },
          { date: subDays(new Date(), 16).toISOString(), revenue: 12870.45, orders: 534, customers: 423 },
          { date: subDays(new Date(), 15).toISOString(), revenue: 9870.20, orders: 412, customers: 345 },
          { date: subDays(new Date(), 14).toISOString(), revenue: 11230.60, orders: 467, customers: 389 },
          { date: subDays(new Date(), 13).toISOString(), revenue: 10560.35, orders: 445, customers: 367 },
          { date: subDays(new Date(), 12).toISOString(), revenue: 12340.70, orders: 512, customers: 423 },
          { date: subDays(new Date(), 11).toISOString(), revenue: 11890.25, orders: 498, customers: 389 },
          { date: subDays(new Date(), 10).toISOString(), revenue: 13450.80, orders: 567, customers: 445 },
          { date: subDays(new Date(), 9).toISOString(), revenue: 10980.15, orders: 445, customers: 367 },
          { date: subDays(new Date(), 8).toISOString(), revenue: 11520.30, orders: 489, customers: 401 },
          { date: subDays(new Date(), 7).toISOString(), revenue: 12870.45, orders: 534, customers: 423 },
          { date: subDays(new Date(), 6).toISOString(), revenue: 9870.20, orders: 412, customers: 345 },
          { date: subDays(new Date(), 5).toISOString(), revenue: 11230.60, orders: 467, customers: 389 },
          { date: subDays(new Date(), 4).toISOString(), revenue: 10560.35, orders: 445, customers: 367 },
          { date: subDays(new Date(), 3).toISOString(), revenue: 12340.70, orders: 512, customers: 423 },
          { date: subDays(new Date(), 2).toISOString(), revenue: 11890.25, orders: 498, customers: 389 },
          { date: subDays(new Date(), 1).toISOString(), revenue: 13450.80, orders: 567, customers: 445 },
        ],
        sales: [
          { date: "2025-01-01", sales: 45000, target: 50000, product: "Premium Widget" },
          { date: "2025-01-02", sales: 48000, target: 45000, product: "Standard Widget" },
          { date: "2025-01-03", sales: 52000, target: 50000, product: "Premium Widget" },
          { date: "2025-01-04", sales: 41000, target: 45000, product: "Basic Widget" },
          { date: "2025-01-05", sales: 49000, target: 50000, product: "Standard Widget" },
          { date: "2025-01-06", sales: 53000, target: 55000, product: "Premium Widget" },
          { date: "2025-01-07", sales: 46000, target: 45000, product: "Basic Widget" },
          { date: "2025-01-08", sales: 51000, target: 50000, product: "Standard Widget" },
          { date: "2025-01-09", sales: 47000, target: 45000, product: "Premium Widget" },
          { date: "2025-01-10", sales: 54000, target: 55000, product: "Premium Widget" },
        ],
        products: [
          { name: "Premium Widget", sales: 234, revenue: 46800, views: 1523, conversionRate: 15.4, stock: 45 },
          { name: "Standard Widget", sales: 189, revenue: 28350, views: 987, conversionRate: 19.2, stock: 123 },
          { name: "Basic Widget", sales: 156, revenue: 15600, views: 2341, conversionRate: 6.7, stock: 234 },
          { name: "Deluxe Widget", sales: 98, revenue: 29400, views: 567, conversionRate: 17.3, stock: 12 },
          { name: "Pro Widget", sales: 67, revenue: 26800, views: 445, conversionRate: 15.1, stock: 8 },
          { name: "Mega Widget", sales: 45, revenue: 22500, views: 334, conversionRate: 13.5, stock: 3 },
        ],
        customers: [
          { date: subDays(new Date(), 30).toISOString(), newCustomers: 45, returningCustomers: 847, totalCustomers: 892 },
          { date: subDays(new Date(), 29).toISOString(), newCustomers: 38, returningCustomers: 823, totalCustomers: 861 },
          { date: subDays(new Date(), 28).toISOString(), newCustomers: 52, returningCustomers: 815, totalCustomers: 867 },
          { date: subDays(new Date(), 27).toISOString(), newCustomers: 41, returningCustomers: 798, totalCustomers: 839 },
          { date: subDays(new Date(), 26).toISOString(), newCustomers: 48, returningCustomers: 812, totalCustomers: 860 },
          { date: subDays(new Date(), 25).toISOString(), newCustomers: 55, returningCustomers: 834, totalCustomers: 889 },
          { date: subDays(new Date(), 24).toISOString(), newCustomers: 33, returningCustomers: 798, totalCustomers: 831 },
          { date: subDays(new Date(), 23).toISOString(), newCustomers: 47, returningCustomers: 823, totalCustomers: 870 },
          { date: subDays(new Date(), 22).toISOString(), newCustomers: 51, returningCustomers: 845, totalCustomers: 896 },
          { date: subDays(new Date(), 21).toISOString(), newCustomers: 39, returningCustomers: 812, totalCustomers: 851 },
          { date: subDays(new Date(), 20).toISOString(), newCustomers: 44, returningCustomers: 834, totalCustomers: 878 },
          { date: subDays(new Date(), 19).toISOString(), newCustomers: 58, returningCustomers: 867, totalCustomers: 925 },
          { date: subDays(new Date(), 18).toISOString(), newCustomers: 42, returningCustomers: 801, totalCustomers: 843 },
          { date: subDays(new Date(), 17).toISOString(), newCustomers: 49, returningCustomers: 823, totalCustomers: 872 },
          { date: subDays(new Date(), 16).toISOString(), newCustomers: 36, returningCustomers: 789, totalCustomers: 825 },
          { date: subDays(new Date(), 15).toISOString(), newCustomers: 53, returningCustomers: 845, totalCustomers: 898 },
          { date: subDays(new Date(), 14).toISOString(), newCustomers: 47, returningCustomers: 812, totalCustomers: 859 },
          { date: subDays(new Date(), 13).toISOString(), newCustomers: 41, returningCustomers: 801, totalCustomers: 842 },
          { date: subDays(new Date(), 12).toISOString(), newCustomers: 55, returningCustomers: 834, totalCustomers: 889 },
          { date: subDays(new Date(), 11).toISOString(), newCustomers: 38, returningCustomers: 789, totalCustomers: 827 },
          { date: subDays(new Date(), 10).toISOString(), newCustomers: 62, returningCustomers: 867, totalCustomers: 929 },
          { date: subDays(new Date(), 9).toISOString(), newCustomers: 45, returningCustomers: 823, totalCustomers: 868 },
          { date: subDays(new Date(), 8).toISOString(), newCustomers: 48, returningCustomers: 812, totalCustomers: 860 },
          { date: subDays(new Date(), 7).toISOString(), newCustomers: 51, returningCustomers: 834, totalCustomers: 885 },
          { date: subDays(new Date(), 6).toISOString(), newCustomers: 43, returningCustomers: 801, totalCustomers: 844 },
          { date: subDays(new Date(), 5).toISOString(), newCustomers: 57, returningCustomers: 856, totalCustomers: 913 },
          { date: subDays(new Date(), 4).toISOString(), newCustomers: 39, returningCustomers: 798, totalCustomers: 837 },
          { date: subDays(new Date(), 3).toISOString(), newCustomers: 52, returningCustomers: 823, totalCustomers: 875 },
          { date: subDays(new Date(), 2).toISOString(), newCustomers: 46, returningCustomers: 845, totalCustomers: 891 },
          { date: subDays(new Date(), 1).toISOString(), newCustomers: 64, returningCustomers: 878, totalCustomers: 942 },
        ],
        traffic: [
          { date: subDays(new Date(), 30).toISOString(), pageViews: 15234, uniqueVisitors: 8923, bounceRate: 42.3, avgSessionDuration: 245 },
          { date: subDays(new Date(), 29).toISOString(), pageViews: 14567, uniqueVisitors: 8456, bounceRate: 41.8, avgSessionDuration: 238 },
          { date: subDays(new Date(), 28).toISOString(), pageViews: 15890, uniqueVisitors: 9234, bounceRate: 39.5, avgSessionDuration: 267 },
          { date: subDays(new Date(), 27).toISOString(), pageViews: 14234, uniqueVisitors: 8567, bounceRate: 43.1, avgSessionDuration: 251 },
          { date: subDays(new Date(), 26).toISOString(), pageViews: 13890, uniqueVisitors: 8234, bounceRate: 44.2, avgSessionDuration: 239 },
          { date: subDays(new Date(), 25).toISOString(), pageViews: 15234, uniqueVisitors: 9012, bounceRate: 40.8, avgSessionDuration: 256 },
          { date: subDays(new Date(), 24).toISOString(), pageViews: 14567, uniqueVisitors: 8789, bounceRate: 41.5, avgSessionDuration: 243 },
          { date: subDays(new Date(), 23).toISOString(), pageViews: 13989, uniqueVisitors: 8456, bounceRate: 42.7, avgSessionDuration: 248 },
          { date: subDays(new Date(), 22).toISOString(), pageViews: 13245, uniqueVisitors: 8123, bounceRate: 43.9, avgSessionDuration: 234 },
          { date: subDays(new Date(), 21).toISOString(), pageViews: 14890, uniqueVisitors: 9234, bounceRate: 40.2, avgSessionDuration: 267 },
          { date: subDays(new Date(), 20).toISOString(), pageViews: 15234, uniqueVisitors: 9567, bounceRate: 39.6, avgSessionDuration: 278 },
          { date: subDays(new Date(), 19).toISOString(), pageViews: 13890, uniqueVisitors: 8234, bounceRate: 44.1, avgSessionDuration: 245 },
          { date: subDays(new Date(), 18).toISOString(), pageViews: 14234, uniqueVisitors: 8890, bounceRate: 41.8, avgSessionDuration: 252 },
          { date: subDays(new Date(), 17).toISOString(), pageViews: 14567, uniqueVisitors: 9123, bounceRate: 42.5, avgSessionDuration: 263 },
          { date: subDays(new Date(), 16).toISOString(), pageViews: 15234, uniqueVisitors: 9876, bounceRate: 40.3, avgSessionDuration: 289 },
          { date: subDays(new Date(), 15).toISOString(), pageViews: 13989, uniqueVisitors: 8456, bounceRate: 43.2, avgSessionDuration: 234 },
          { date: subDays(new Date(), 14).toISOString(), pageViews: 13245, uniqueVisitors: 8234, bounceRate: 44.8, avgSessionDuration: 241 },
          { date: subDays(new Date(), 13).toISOString(), pageViews: 14890, uniqueVisitors: 9234, bounceRate: 40.7, avgSessionDuration: 278 },
          { date: subDays(new Date(), 12).toISOString(), pageViews: 15234, uniqueVisitors: 9678, bounceRate: 39.4, avgSessionDuration: 298 },
          { date: subDays(new Date(), 11).toISOString(), pageViews: 13890, uniqueVisitors: 8901, bounceRate: 42.1, avgSessionDuration: 245 },
          { date: subDays(new Date(), 10).toISOString(), pageViews: 14567, uniqueVisitors: 9456, bounceRate: 41.5, avgSessionDuration: 267 },
          { date: subDays(new Date(), 9).toISOString(), pageViews: 15234, uniqueVisitors: 10234, bounceRate: 38.9, avgSessionDuration: 312 },
          { date: subDays(new Date(), 8).toISOString(), pageViews: 13989, uniqueVisitors: 8789, bounceRate: 43.6, avgSessionDuration: 234 },
          { date: subDays(new Date(), 7).toISOString(), pageViews: 14234, uniqueVisitors: 9123, bounceRate: 42.9, avgSessionDuration: 256 },
          { date: subDays(new Date(), 6).toISOString(), pageViews: 14890, uniqueVisitors: 9876, bounceRate: 40.2, avgSessionDuration: 289 },
          { date: subDays(new Date(), 5).toISOString(), pageViews: 15234, uniqueVisitors: 10567, bounceRate: 39.7, avgSessionDuration: 323 },
          { date: subDays(new Date(), 4).toISOString(), pageViews: 13890, uniqueVisitors: 9234, bounceRate: 44.1, avgSessionDuration: 245 },
          { date: subDays(new Date(), 3).toISOString(), pageViews: 14567, uniqueVisitors: 11234, bounceRate: 41.8, avgSessionDuration: 267 },
          { date: subDays(new Date(), 2).toISOString(), pageViews: 15234, uniqueVisitors: 10890, bounceRate: 40.5, avgSessionDuration: 298 },
          { date: subDays(new Date(), 1).toISOString(), pageViews: 13989, uniqueVisitors: 9456, bounceRate: 43.2, avgSessionDuration: 234 },
        ],
        topPages: [
          { url: "/products", pageViews: 15234, uniqueVisitors: 8923, avgTimeOnPage: 245, bounceRate: 32.1 },
          { url: "/", pageViews: 12456, uniqueVisitors: 7234, avgTimeOnPage: 189, bounceRate: 28.7 },
          { url: "/search", pageViews: 9876, uniqueVisitors: 5678, avgTimeOnPage: 167, bounceRate: 45.3 },
          { url: "/cart", pageViews: 6543, uniqueVisitors: 3234, avgTimeOnPage: 134, bounceRate: 38.9 },
          { url: "/checkout", pageViews: 4321, uniqueVisitors: 2123, avgTimeOnPage: 298, bounceRate: 12.4 },
          { url: "/account", pageViews: 3456, uniqueVisitors: 1890, avgTimeOnPage: 234, bounceRate: 41.2 },
          { url: "/product/premium-widget", pageViews: 2890, uniqueVisitors: 1567, avgTimeOnPage: 312, bounceRate: 28.9 },
          { url: "/categories/electronics", pageViews: 2345, uniqueVisitors: 1234, avgTimeOnPage: 267, bounceRate: 35.6 },
          { url: "/about", pageViews: 1987, uniqueVisitors: 987, avgTimeOnPage: 145, bounceRate: 52.3 },
        ],
        conversionFunnel: [
          { stage: "Homepage", users: 10000, conversionRate: 100, dropOffRate: 0 },
          { stage: "Product View", users: 4500, conversionRate: 45, dropOffRate: 55 },
          { stage: "Add to Cart", users: 2250, conversionRate: 50, dropOffRate: 50 },
          { stage: "Checkout", users: 1350, conversionRate: 60, dropOffRate: 40 },
          { stage: "Purchase", users: 810, conversionRate: 60, dropOffRate: 40 },
        ],
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const handleExport = async (type: string) => {
    try {
      // In production, this would generate and download a CSV/Excel file
      const csv = [
        ["Date", "Revenue", "Orders", "Customers"],
        ...data!.revenue.map(item => [
          format(parseISO(item.date), "yyyy-MM-dd"),
          item.revenue.toString(),
          item.orders.toString(),
          item.customers.toString()
        ])
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${type}-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${type} data has been exported`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          <p className="text-gray-600">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Try Again
          </Button>
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
              <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
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
                variant="outline"
                size="sm"
                onClick={() => handleExport('revenue')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <ArrowUpRight className="inline h-3 w-3 text-green-500 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.overview.totalOrders)}</div>
              <p className="text-xs text-muted-foreground">
                <ArrowUpRight className="inline h-3 w-3 text-green-500 mr-1" />
                +8.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.overview.totalCustomers)}</div>
              <p className="text-xs text-muted-foreground">
                <ArrowUpRight className="inline h-3 w-3 text-green-500 mr-1" />
                +15.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(data.overview.conversionRate)}</div>
              <p className="text-xs text-muted-foreground">
                <ArrowDownRight className="inline h-3 w-3 text-red-500 mr-1" />
                -2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue over selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value / 1000}k`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name,
                          `$${formatCurrency(value)}`
                        ]}
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={COLORS.primary} 
                        fill={COLORS.primary} 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sales Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Daily sales vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.sales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value / 1000}k`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                      <Bar dataKey="sales" fill={COLORS.primary} />
                      <Bar dataKey="target" fill={COLORS.gray} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New vs returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.customers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => value.toString()}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                    />
                    <Line type="monotone" dataKey="newCustomers" stroke={COLORS.green} strokeWidth={2} />
                    <Line type="monotone" dataKey="returningCustomers" stroke={COLORS.blue} strokeWidth={2} />
                    <Line type="monotone" dataKey="totalCustomers" stroke={COLORS.purple} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Website Traffic</CardTitle>
                <CardDescription>Page views and visitor metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.traffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => value.toString()}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pageViews" 
                      stroke={COLORS.blue} 
                      fill={COLORS.blue} 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Customer journey conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.conversionFunnel.map((stage, index) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex items-center justify-center text-xs font-medium"
                            style={{
                              backgroundColor: index === 0 ? COLORS.primary :
                                             index === 1 ? COLORS.blue :
                                             index === 2 ? COLORS.green :
                                             index === 3 ? COLORS.yellow :
                                             COLORS.orange,
                              color: 'white'
                            }}
                          >
                            {stage.users.toLocaleString()}
                          </div>
                          <span className="text-sm font-medium">{stage.stage}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercent(stage.conversionRate)}</div>
                          <div className="text-xs text-gray-500">{formatPercent(stage.dropOffRate)} drop-off</div>
                        </div>
                      </div>
                      {index < data.conversionFunnel.length - 1 && (
                        <div className="w-full h-px bg-gray-200 my-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.products.slice(0, 5).map((product, index) => (
                    <div key={product.name}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatNumber(product.sales)} sold • {formatCurrency(product.revenue)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercent(product.conversionRate)}</div>
                          <div className="text-xs text-gray-500">{formatNumber(product.views)} views</div>
                        </div>
                      </div>
                      {index < 4 && (
                        <div className="w-full h-px bg-gray-200 mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Revenue by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: "Products", value: 184750, fill: COLORS.primary },
                          { name: "Shipping", value: 45000, fill: COLORS.secondary },
                          { name: "Services", value: 35000, fill: COLORS.tertiary },
                          { name: "Other", value: 20000, fill: COLORS.quaternary },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.75;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="middle" fontSize="12">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        <Cell fill={COLORS.primary} />
                        <Cell fill={COLORS.secondary} />
                        <Cell fill={COLORS.tertiary} />
                        <Cell fill={COLORS.quaternary} />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>Key revenue indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Daily Revenue</span>
                    <span className="text-sm font-medium">{formatCurrency(9491.68)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Revenue Day</span>
                    <span className="text-sm font-medium">{formatCurrency(13450.80)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <span className="text-sm font-medium text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue per Order</span>
                    <span className="text-sm font-medium">{formatCurrency(data.overview.totalRevenue / data.overview.totalOrders)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Sales by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.products} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value / 1000}k`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                      <Bar dataKey="sales" fill={COLORS.primary} />
                      <Bar dataKey="revenue" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Product Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Analytics</CardTitle>
                  <CardDescription>Key product metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <span className="text-sm font-medium">{data.products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Price</span>
                    <span className="text-sm font-medium">{formatCurrency(data.products.reduce((sum, p) => sum + p.revenue, 0) / data.products.reduce((sum, p) => sum + p.sales, 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Conversion</span>
                    <span className="text-sm font-medium">{formatPercent(data.products.reduce((sum, p) => sum + p.conversionRate, 0) / data.products.length)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Low Stock Alert</span>
                    <Badge variant="destructive" className="text-xs">
                      {data.products.filter(p => p.stock < 10).length} items
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Acquisition */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                  <CardDescription>New customer acquisition trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.customers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => value.toString()}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="newCustomers" 
                        stroke={COLORS.green} 
                        fill={COLORS.green} 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Retention */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
                  <CardDescription>New vs returning customer ratio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.customers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="returningCustomers" 
                        stroke={COLORS.blue} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Customer Metrics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
                <CardDescription>Key customer insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Growth Rate</span>
                  <span className="text-sm font-medium text-green-600">+15.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Returning Customer Rate</span>
                  <span className="text-sm font-medium">{formatPercent((data.customers[data.customers.length - 1].returningCustomers / data.customers[data.customers.length - 1].totalCustomers) * 100)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Order Value</span>
                  <span className="text-sm font-medium">{formatCurrency(data.overview.averageOrderValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                  <span className="text-sm font-medium">{formatCurrency(data.overview.totalRevenue / data.overview.totalCustomers)}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Traffic by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: "Direct", value: 35, fill: COLORS.primary },
                          { name: "Search", value: 25, fill: COLORS.secondary },
                          { name: "Social Media", value: 20, fill: COLORS.tertiary },
                          { name: "Referral", value: 15, fill: COLORS.quaternary },
                          { name: "Email", value: 5, fill: COLORS.quinary },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.75;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="middle" fontSize="12">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        <Cell fill={COLORS.primary} />
                        <Cell fill={COLORS.secondary} />
                        <Cell fill={COLORS.tertiary} />
                        <Cell fill={COLORS.quaternary} />
                        <Cell fill={COLORS.quinary} />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Traffic Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Trends</CardTitle>
                  <CardDescription>Page views and visitor trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.traffic}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => value.toString()}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pageViews" 
                        stroke={COLORS.blue} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="uniqueVisitors" 
                        stroke={COLORS.green} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPages.slice(0, 8).map((page, index) => (
                    <div key={page.url}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">{page.url}</div>
                          <div className="text-xs text-gray-500">
                            {formatNumber(page.pageViews)} views • {formatNumber(page.uniqueVisitors)} visitors
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercent(page.bounceRate)}</div>
                          <div className="text-xs text-gray-500">{formatNumber(Math.round(page.avgTimeOnPage))}s avg</div>
                        </div>
                      </div>
                      {index < data.topPages.length - 1 && (
                        <div className="w-full h-px bg-gray-200 mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
