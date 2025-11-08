import { woocommerceAPI } from '../wordpress';
import { 
  WooCommerceCustomer, 
  WooCommerceOrder 
} from '../../types/wordpress';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  avatar?: string;
  dateRegistered: string;
  lastLogin?: string;
  totalSpent: number;
  orderCount: number;
  isPayingCustomer: boolean;
}

export interface Address {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export class UserService {
  // Get user profile
  async getUserProfile(customerId: number): Promise<UserProfile | null> {
    try {
      const customer = await woocommerceAPI.getCustomer(customerId);
      
      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        displayName: `${customer.first_name} ${customer.last_name}`,
        username: customer.username,
        avatar: customer.avatar_url,
        dateRegistered: customer.date_created,
        totalSpent: parseFloat(customer.total_spent),
        orderCount: customer.orders_count,
        isPayingCustomer: customer.is_paying_customer
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(customerId: number, profileData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    billing?: Partial<Address>;
    shipping?: Partial<Address>;
  }): Promise<WooCommerceCustomer | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Get user orders
  async getUserOrders(customerId: number, params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<WooCommerceOrder[]> {
    try {
      return await woocommerceAPI.getOrders({
        customer_id: customerId,
        ...params
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  // Get single order
  async getUserOrder(customerId: number, orderId: number): Promise<WooCommerceOrder | null> {
    try {
      const order = await woocommerceAPI.getOrder(orderId);
      
      // Verify order belongs to customer
      if (order.customer_id !== customerId) {
        throw new Error('Unauthorized access to order');
      }
      
      return order;
    } catch (error) {
      console.error('Error getting user order:', error);
      return null;
    }
  }

  // Get user addresses
  async getUserAddresses(customerId: number): Promise<{
    billing: Address;
    shipping: Address;
  } | null> {
    try {
      const customer = await woocommerceAPI.getCustomer(customerId);
      
      return {
        billing: customer.billing,
        shipping: customer.shipping
      };
    } catch (error) {
      console.error('Error getting user addresses:', error);
      return null;
    }
  }

  // Update user address
  async updateUserAddress(customerId: number, addressType: 'billing' | 'shipping', addressData: Partial<Address>): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
        body: JSON.stringify({
          [addressType]: addressData
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating user address:', error);
      return false;
    }
  }

  // Get user downloadables (for digital products)
  async getUserDownloads(customerId: number): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}/downloads`, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return [];
    } catch (error) {
      console.error('Error getting user downloads:', error);
      return [];
    }
  }

  // Get user payment methods
  async getUserPaymentMethods(customerId: number): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${customerId}/payment_methods`, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return [];
    } catch (error) {
      console.error('Error getting user payment methods:', error);
      return [];
    }
  }

  // Get user statistics
  async getUserStatistics(customerId: number): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategories: string[];
    lastOrderDate?: string;
  }> {
    try {
      const orders = await this.getUserOrders(customerId);
      const customer = await woocommerceAPI.getCustomer(customerId);
      
      const totalOrders = orders.length;
      const totalSpent = parseFloat(customer.total_spent);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      // Get favorite categories (simplified - would need to analyze order items)
      const favoriteCategories: string[] = [];
      
      // Get last order date
      const lastOrderDate = orders.length > 0 ? orders[0].date_created : undefined;

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        favoriteCategories,
        lastOrderDate
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteCategories: []
      };
    }
  }

  // Create user wishlist (if wishlist plugin is available)
  async getUserWishlist(customerId: number): Promise<number[]> {
    try {
      // This would integrate with a wishlist plugin like YITH WooCommerce Wishlist
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/yith-wcwl/v1/wishlist`, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.products || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      return [];
    }
  }

  // Add to wishlist
  async addToWishlist(customerId: number, productId: number): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/yith-wcwl/v1/add-to-wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: customerId
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  }

  // Remove from wishlist
  async removeFromWishlist(customerId: number, productId: number): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/yith-wcwl/v1/remove-from-wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: customerId
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  // Get user notifications
  async getUserNotifications(customerId: number): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/custom/v1/user-notifications/${customerId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/custom/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
          })
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userService = new UserService();