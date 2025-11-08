"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Truck,
  Star,
  Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface UserSidebarProps {
  userName?: string;
  userAvatar?: string;
  className?: string;
}

export default function UserSidebar({ 
  userName = "John Doe", 
  userAvatar = "/api/placeholder/40/40",
  className = "" 
}: UserSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      section: "Account",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: User,
          href: "/account",
          description: "Account overview"
        },
        {
          id: "profile",
          label: "Profile Settings",
          icon: Settings,
          href: "/account/profile",
          description: "Update your information"
        },
        {
          id: "addresses",
          label: "Addresses",
          icon: MapPin,
          href: "/account/addresses",
          description: "Manage shipping addresses"
        },
        {
          id: "payment",
          label: "Payment Methods",
          icon: CreditCard,
          href: "/account/payment",
          description: "Manage payment options"
        }
      ]
    },
    {
      section: "Shopping",
      items: [
        {
          id: "orders",
          label: "My Orders",
          icon: Package,
          href: "/account/orders",
          description: "View order history"
        },
        {
          id: "wishlist",
          label: "Wishlist",
          icon: Heart,
          href: "/account/wishlist",
          description: "Your saved items"
        },
        {
          id: "cart",
          label: "Shopping Cart",
          icon: ShoppingBag,
          href: "/cart",
          description: "View your cart"
        }
      ]
    },
    {
      section: "Support",
      items: [
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          href: "/account/notifications",
          description: "Account updates"
        },
        {
          id: "tracking",
          label: "Order Tracking",
          icon: Truck,
          href: "/account/tracking",
          description: "Track your orders"
        },
        {
          id: "reviews",
          label: "My Reviews",
          icon: Star,
          href: "/account/reviews",
          description: "Product reviews"
        }
      ]
    }
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className} ${isCollapsed ? 'w-20' : 'w-80'} transition-all duration-300`}>
      {/* User Profile Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <Badge className="absolute -bottom-1 -right-1 w-5 h-5 p-0 bg-green-500 border-2 border-white">
              <span className="text-xs">✓</span>
            </Badge>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{userName}</h3>
              <p className="text-sm text-gray-500">Premium Member</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            {!isCollapsed && (
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.section}
              </h4>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive(item.href)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.id === 'wishlist' && (
                          <Badge variant="secondary" className="text-xs">
                            12
                          </Badge>
                        )}
                        {item.id === 'notifications' && (
                          <Badge variant="destructive" className="text-xs bg-red-500">
                            3
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-3" />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
}