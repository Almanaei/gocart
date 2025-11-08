import { NextRequest, NextResponse } from 'next/server';
import { wordpressAPIProxy } from '@/lib/api-proxy';
import { z } from 'zod';

// Input validation schemas
const addToCartSchema = z.object({
  productId: z.number().min(1),
  quantity: z.number().min(1).max(100).default(1),
});

const updateCartItemSchema = z.object({
  key: z.string().min(1),
  quantity: z.number().min(1).max(100),
});

const removeFromCartSchema = z.object({
  key: z.string().min(1),
});

// GET - Fetch cart
export async function GET() {
  try {
    const cart = await wordpressAPIProxy.getCart();
    
    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = addToCartSchema.parse(body);
    
    const result = await wordpressAPIProxy.addToCart(productId, quantity);
    
    if (!result) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to add item to cart'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add item to cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, quantity } = updateCartItemSchema.parse(body);
    
    const result = await wordpressAPIProxy.updateCartItem(key, quantity);
    
    if (!result) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update cart item'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update cart item',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing cart item key'
        },
        { status: 400 }
      );
    }
    
    const validatedData = removeFromCartSchema.parse({ key });
    const result = await wordpressAPIProxy.removeFromCart(validatedData.key);
    
    if (!result) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to remove item from cart'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to remove item from cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}