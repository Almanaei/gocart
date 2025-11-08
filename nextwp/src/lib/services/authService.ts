import { wordpressAPI } from '../wordpress';
import { WooCommerceCustomer } from '../../types/wordpress';

export interface AuthResponse {
  success: boolean;
  customer?: WooCommerceCustomer;
  token?: string;
  error?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  username?: string;
}

export class AuthService {
  private tokenKey = 'wordpress_auth_token';
  private customerKey = 'wordpress_customer_data';

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // For WordPress, we'll use JWT authentication or Application Passwords
      // This is a simplified implementation
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.token) {
        // Store token
        this.setToken(data.token);
        
        // Get customer data
        const customer = await this.getCurrentCustomer(data.token);
        
        // Store customer data
        this.setCustomerData(customer);

        return {
          success: true,
          customer,
          token: data.token
        };
      }

      return {
        success: false,
        error: data.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const customer = await wordpressAPI.createCustomer({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username || userData.email,
        password: userData.password
      });

      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  // Get current customer
  async getCurrentCustomer(token?: string): Promise<WooCommerceCustomer | null> {
    try {
      const authToken = token || this.getToken();
      
      if (!authToken) {
        return null;
      }

      // Get customer ID from token (this depends on your JWT implementation)
      const customerId = this.getCustomerIdFromToken(authToken);
      
      if (!customerId) {
        return null;
      }

      const customer = await wordpressAPI.getCustomer(customerId);
      return customer;
    } catch (error) {
      console.error('Error getting current customer:', error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear stored data
      this.removeToken();
      this.removeCustomerData();
      
      // Optionally: Invalidate token on server
      const token = this.getToken();
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token/revoke`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      // Validate token with server
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  // Get stored token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // Set token
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  // Remove token
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  // Get customer data
  getCustomerData(): WooCommerceCustomer | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(this.customerKey);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  // Set customer data
  setCustomerData(customer: WooCommerceCustomer): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.customerKey, JSON.stringify(customer));
    }
  }

  // Remove customer data
  removeCustomerData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.customerKey);
    }
  }

  // Get customer ID from token (simplified)
  private getCustomerIdFromToken(token: string): number | null {
    try {
      // This is a simplified implementation
      // In a real app, you'd decode the JWT token
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.data?.user?.id || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Update customer profile
  async updateCustomer(customerData: Partial<WooCommerceCustomer>): Promise<WooCommerceCustomer | null> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const currentCustomer = this.getCustomerData();
      if (!currentCustomer) {
        throw new Error('No customer data found');
      }

      // Update customer via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${currentCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      const updatedCustomer = await response.json();
      
      // Update stored customer data
      this.setCustomerData(updatedCustomer);

      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      return null;
    }
  }

  // Get customer orders
  async getCustomerOrders(): Promise<any[]> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const currentCustomer = this.getCustomerData();
      if (!currentCustomer) {
        throw new Error('No customer data found');
      }

      const orders = await woocommerceAPI.getOrders({
        customer_id: currentCustomer.id
      });

      return orders;
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/lost-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_login: email }),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Password reset email sent'
        };
      }

      return {
        success: false,
        message: 'Failed to send reset email'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Failed to send reset email'
      };
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.token);
        return data.token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();