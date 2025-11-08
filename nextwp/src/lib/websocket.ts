import React from 'react';

// WebSocket service for real-time updates
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private isConnecting = false;
  private messageQueue: any[] = [];

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
                 (process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace('http', 'ws') + '/ws');
    
    try {
      this.ws = new WebSocket(`${wsUrl}/realtime`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Send queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }
        
        // Resubscribe to all channels
        this.subscriptions.forEach((_, channel) => {
          this.subscribe(channel);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  private handleMessage(data: { type: string; channel: string; payload: any }): void {
    const { type, channel, payload } = data;
    
    switch (type) {
      case 'broadcast':
        this.notifySubscribers(channel, payload);
        break;
      case 'subscription_ack':
        console.log(`Subscribed to channel: ${channel}`);
        break;
      case 'error':
        console.error('WebSocket error:', payload);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  private notifySubscribers(channel: string, data: any): void {
    const callbacks = this.subscriptions.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscription callback:', error);
        }
      });
    }
  }

  subscribe(channel: string, callback?: (data: any) => void): () => void {
    // Add callback if provided
    if (callback) {
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel)!.add(callback);
    }

    // Send subscription message
    this.send({
      type: 'subscribe',
      channel
    });

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(channel);
      if (callbacks && callback) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(channel);
          this.send({
            type: 'unsubscribe',
            channel
          });
        }
      }
    };
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
    }
  }

  // Specific subscription methods
  subscribeToCartUpdates(callback: (cartData: any) => void): () => void {
    return this.subscribe('cart', callback);
  }

  subscribeToInventoryUpdates(callback: (inventoryData: any) => void): () => void {
    return this.subscribe('inventory', callback);
  }

  subscribeToProductUpdates(callback: (productData: any) => void): () => void {
    return this.subscribe('product', callback);
  }

  subscribeToOrderUpdates(callback: (orderData: any) => void): () => void {
    return this.subscribe('order', callback);
  }

  // Broadcast methods (for admin actions)
  broadcastCartUpdate(cartData: any): void {
    this.send({
      type: 'broadcast',
      channel: 'cart',
      payload: cartData
    });
  }

  broadcastInventoryUpdate(productId: number, stockQuantity: number): void {
    this.send({
      type: 'broadcast',
      channel: 'inventory',
      payload: { productId, stockQuantity }
    });
  }

  broadcastProductUpdate(productData: any): void {
    this.send({
      type: 'broadcast',
      channel: 'product',
      payload: productData
    });
  }

  // Connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Cleanup
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  // Heartbeat to keep connection alive
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 30 seconds
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Export singleton instance
export const wsService = new WebSocketService();

// React hook for WebSocket subscriptions
export function useWebSocketSubscription(
  channel: string,
  callback: (data: any) => void,
  deps: React.DependencyList = []
) {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const unsubscribe = wsService.subscribe(channel, callback);
    
    return () => {
      unsubscribe();
    };
  }, deps);
}

// React hooks for specific subscriptions
export function useCartSubscription(callback: (cartData: any) => void, deps: React.DependencyList = []) {
  return useWebSocketSubscription('cart', callback, deps);
}

export function useInventorySubscription(callback: (inventoryData: any) => void, deps: React.DependencyList = []) {
  return useWebSocketSubscription('inventory', callback, deps);
}

export function useProductSubscription(callback: (productData: any) => void, deps: React.DependencyList = []) {
  return useWebSocketSubscription('product', callback, deps);
}

export function useOrderSubscription(callback: (orderData: any) => void, deps: React.DependencyList = []) {
  return useWebSocketSubscription('order', callback, deps);
}

// React hook for connection status
export function useWebSocketStatus() {
  const [status, setStatus] = React.useState(() => wsService.getConnectionState());
  const [isConnected, setIsConnected] = React.useState(() => wsService.isConnected());

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      setStatus(wsService.getConnectionState());
      setIsConnected(wsService.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { status, isConnected };
}