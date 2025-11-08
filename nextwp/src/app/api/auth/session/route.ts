import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No active session',
          authenticated: false
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.userId,
          email: session.email,
          name: session.name,
        },
        expiresAt: session.expiresAt,
      },
      authenticated: true,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check session',
        authenticated: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}