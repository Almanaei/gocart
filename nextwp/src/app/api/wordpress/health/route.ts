import { NextRequest, NextResponse } from 'next/server';
import { wcService } from '@/lib/wordpress-api';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check if WordPress URL is configured
    const wordpressUrl = process.env.WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    
    if (!wordpressUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'WordPress configuration missing',
        details: {
          wordpressUrl: !!wordpressUrl,
          consumerKey: !!consumerKey,
          consumerSecret: !!consumerSecret,
        },
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Test basic WordPress connection
    const wordpressResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/system_status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;
    
    if (!wordpressResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'WordPress API connection failed',
        details: {
          httpStatus: wordpressResponse.status,
          httpStatusText: wordpressResponse.statusText,
          responseTime: `${responseTime}ms`,
        },
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    const systemStatus = await wordpressResponse.json();

    // Test WooCommerce API specifically
    const productsResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/products?per_page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const productsData = productsResponse.ok ? await productsResponse.json() : null;

    // Test JWT authentication if configured
    let jwtTest: { available: boolean; status?: number; error?: string } | null = null;
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      try {
        const jwtResponse = await fetch(`${wordpressUrl}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'test', // This will fail but tests the endpoint
            password: 'test',
          }),
          signal: AbortSignal.timeout(5000),
        });
        
        jwtTest = {
          available: jwtResponse.status !== 404,
          status: jwtResponse.status,
        };
      } catch (error) {
        jwtTest = {
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'WordPress connection successful',
      data: {
        wordpress: {
          url: wordpressUrl,
          responseTime: `${responseTime}ms`,
          version: systemStatus.environment?.version || 'Unknown',
        },
        woocommerce: {
          connected: productsResponse.ok,
          productsAvailable: productsData ? productsData.length : 0,
          apiVersion: systemStatus.environment?.wc_version || 'Unknown',
        },
        authentication: {
          basic: 'Configured',
          jwt: jwtTest,
        },
        performance: {
          responseTime: `${responseTime}ms`,
          status: responseTime < 2000 ? 'Good' : responseTime < 5000 ? 'Fair' : 'Poor',
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('WordPress health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType } = body;

    switch (testType) {
      case 'products':
        return await testProductsConnection();
      case 'orders':
        return await testOrdersConnection();
      case 'customers':
        return await testCustomersConnection();
      default:
        return NextResponse.json({
          status: 'error',
          message: 'Invalid test type',
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function testProductsConnection() {
  try {
    const products = await wcService.getProducts({ per_page: 5 });
    
    return NextResponse.json({
      status: 'success',
      message: 'Products API working',
      data: {
        count: products.length,
        sample: products.slice(0, 2).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock_status: p.stock_status,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Products API failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function testOrdersConnection() {
  try {
    const orders = await wcService.getOrders(undefined, { per_page: 5 });
    
    return NextResponse.json({
      status: 'success',
      message: 'Orders API working',
      data: {
        count: orders.length,
        sample: orders.slice(0, 2).map(o => ({
          id: o.id,
          status: o.status,
          total: o.total,
          date_created: o.date_created,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Orders API failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function testCustomersConnection() {
  try {
    // Note: This would require admin credentials in a real scenario
    // For now, we'll test if the endpoint is accessible
    const wordpressUrl = process.env.WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    
    const response = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers?per_page=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (response.ok) {
      const customers = await response.json();
      return NextResponse.json({
        status: 'success',
        message: 'Customers API working',
        data: {
          count: customers.length,
          sample: customers.slice(0, 2).map((c: any) => ({
            id: c.id,
            email: c.email,
            first_name: c.first_name,
            last_name: c.last_name,
          })),
        },
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Customers API failed',
        error: `HTTP ${response.status}: ${response.statusText}`,
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Customers API failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
