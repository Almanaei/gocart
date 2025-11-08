import { NextRequest, NextResponse } from 'next/server';
import { wordpressAPIProxy } from '@/lib/api-proxy';
import { z } from 'zod';

// Input validation schema
const productsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
  category: z.coerce.number().optional(),
  search: z.string().max(100).optional(),
  featured: z.coerce.boolean().optional(),
  on_sale: z.coerce.boolean().optional(),
  orderby: z.enum(['date', 'title', 'price', 'popularity', 'rating']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = productsQuerySchema.parse(queryObject);
    
    // Fetch products using the secure proxy
    const products = await wordpressAPIProxy.getProducts(validatedQuery);
    
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Products API error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}