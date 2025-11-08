import { NextRequest, NextResponse } from 'next/server';
import { wcService } from '@/lib/wordpress-api';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Create the order in WooCommerce
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to create order' },
        { status: response.status }
      );
    }

    const order = await response.json();

    // Clear the cart after successful order creation
    // In a real implementation, you would want to clear the user's cart here

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
