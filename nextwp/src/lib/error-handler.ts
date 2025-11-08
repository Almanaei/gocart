import { NextResponse } from 'next/server';

export class APIError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof Error && error.name === 'ZodError') {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: (error as any).issues || [],
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
    { status: 500 }
  );
}

export function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<NextResponse> {
  return async (...args: any[]): Promise<NextResponse> => {
    try {
      const result = await fn(...args);
      
      // If the function already returns a NextResponse, return it as-is
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Otherwise, wrap it in a success response
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

// Error logging utility
export function logError(
  error: Error,
  context: {
    endpoint?: string;
    method?: string;
    userId?: string;
    requestId?: string;
    [key: string]: any;
  } = {}
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  };

  // In production, you'd send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to your logging service (e.g., Sentry, LogRocket, etc.)
    console.error(JSON.stringify(logData));
  } else {
    console.error('Error Details:', JSON.stringify(logData, null, 2));
  }
}

// Rate limiting utility
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitStore.get(key);

  // Clean up expired records
  if (record && now > record.resetTime) {
    rateLimitStore.delete(key);
  }

  const currentRecord = rateLimitStore.get(key);
  
  if (!currentRecord) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    
    return {
      success: true,
      resetTime: newRecord.resetTime,
      remaining: maxRequests - 1,
    };
  }

  if (currentRecord.count >= maxRequests) {
    return {
      success: false,
      resetTime: currentRecord.resetTime,
      remaining: 0,
    };
  }

  currentRecord.count++;
  
  return {
    success: true,
    resetTime: currentRecord.resetTime,
    remaining: maxRequests - currentRecord.count,
  };
}

// Request validation utility
export function validateRequest(
  request: Request,
  schema?: {
    body?: any;
    query?: any;
    params?: any;
  }
): { body?: any; query?: any; params?: any } {
  const result: { body?: any; query?: any; params?: any } = {};

  // Validate body
  if (schema?.body) {
    try {
      result.body = schema.body.parse(request.body);
    } catch (error) {
      throw new ValidationError('Invalid request body', error);
    }
  }

  // Validate query parameters
  if (schema?.query) {
    try {
      const url = new URL(request.url);
      const queryObject = Object.fromEntries(url.searchParams.entries());
      result.query = schema.query.parse(queryObject);
    } catch (error) {
      throw new ValidationError('Invalid query parameters', error);
    }
  }

  // Validate path parameters
  if (schema?.params) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const pathParts = pathname.split('/').filter(Boolean);
      
      // This is a simplified implementation
      // In a real app, you'd extract params based on the route pattern
      result.params = schema.params.parse(pathParts);
    } catch (error) {
      throw new ValidationError('Invalid path parameters', error);
    }
  }

  return result;
}