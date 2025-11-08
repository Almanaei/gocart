import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
  id: string;
  type: 'order' | 'product' | 'user' | 'system' | 'success' | 'error' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// In-memory storage for demo purposes
// In production, this would be stored in a database like Redis or MongoDB
let notifications: Notification[] = [];

// Initialize with some demo notifications
const initDemoNotifications = () => {
  if (notifications.length === 0) {
    notifications = [
      {
        id: uuidv4(),
        type: 'system',
        title: 'Welcome to NextWP!',
        message: 'Your e-commerce platform is ready to use.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
      },
      {
        id: uuidv4(),
        type: 'order',
        title: 'New Order Received',
        message: 'Order #1234 has been placed successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: true,
      },
      {
        id: uuidv4(),
        type: 'product',
        title: 'Product Update',
        message: 'Product "Premium Widget" is now back in stock.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
      },
    ];
  }
};

initDemoNotifications();

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let userNotifications = notifications;
    
    // Filter by user ID if provided
    if (userId && userId !== 'all') {
      userNotifications = notifications.filter(n => 
        !n.userId || n.userId === userId || n.userId === 'all'
      );
    }
    
    // Filter unread only if requested
    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }
    
    // Sort by timestamp (newest first)
    userNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Limit results
    const limitedNotifications = userNotifications.slice(0, limit);
    
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    return NextResponse.json({
      notifications: limitedNotifications,
      unreadCount,
      total: userNotifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.message || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, type' },
        { status: 400 }
      );
    }
    
    const notification: Notification = {
      id: uuidv4(),
      type: body.type,
      title: body.title,
      message: body.message,
      timestamp: new Date().toISOString(),
      read: false,
      userId: body.userId,
      actionUrl: body.actionUrl,
      metadata: body.metadata,
    };
    
    // Add to notifications array
    notifications.unshift(notification);
    
    // Keep only last 1000 notifications to prevent memory issues
    if (notifications.length > 1000) {
      notifications = notifications.slice(0, 1000);
    }
    
    // In a real implementation, this would also:
    // 1. Send push notifications
    // 2. Send email notifications
    // 3. Emit WebSocket events
    // 4. Store in database
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Clear all notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId && userId !== 'all') {
      // Clear only user-specific notifications
      notifications = notifications.filter(n => 
        n.userId && n.userId !== userId
      );
    } else {
      // Clear all notifications
      notifications = [];
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notifications cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
