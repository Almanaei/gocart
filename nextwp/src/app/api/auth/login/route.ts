import { NextRequest, NextResponse } from 'next/server';
import { wordpressAPIProxy } from '@/lib/api-proxy';
import { createSession, checkRateLimit } from '@/lib/auth';
import { z } from 'zod';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    
    // Rate limiting based on email
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Too many login attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }
    
    // For WordPress authentication, we need to use the JWT endpoint
    // This is a simplified implementation - in production, you'd want more robust auth
    const authResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password,
      }),
    });
    
    if (!authResponse.ok) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }
    
    const authData = await authResponse.json();
    
    if (!authData.token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication failed',
          code: 'AUTH_FAILED'
        },
        { status: 401 }
      );
    }
    
    // Get customer data from WooCommerce
    let customer: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    } | null = null;
    
    try {
      // In a real implementation, you'd have a proper endpoint to get customer by email
      // For now, we'll create a basic customer object from the JWT response
      const displayName = authData.data?.user?.display_name || 'User Name';
      const nameParts = displayName.split(' ');
      
      customer = {
        id: authData.data?.user?.id || 0,
        email,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || 'Name',
      };
    } catch (error) {
      console.error('Error processing customer data:', error);
      // Continue with basic user data
      customer = {
        id: 0,
        email,
        firstName: 'User',
        lastName: 'Name',
      };
    }
    
    // Create session
    await createSession({
      id: customer.id,
      email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: customer.id,
          email,
          name: `${customer.firstName} ${customer.lastName}`,
        },
        token: authData.token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input data',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}