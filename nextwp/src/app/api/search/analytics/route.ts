import { NextRequest, NextResponse } from 'next/server';

interface SearchEvent {
  query: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    sortBy?: string;
  };
  resultsCount: number;
  userAgent?: string;
  ip?: string;
}

interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
    avgResults: number;
  }>;
  filterUsage: Record<string, number>;
  searchTrends: Array<{
    date: string;
    searches: number;
  }>;
  noResultQueries: Array<{
    query: string;
    count: number;
  }>;
}

// In-memory storage for demo purposes
// In production, this would be stored in a database
const searchEvents: SearchEvent[] = [];
const analyticsCache: {
  data: SearchAnalytics | null;
  lastUpdated: string | null;
} = {
  data: null,
  lastUpdated: null,
};

// Cache analytics for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

function generateAnalytics(): SearchAnalytics {
  const queryCounts = new Map<string, { count: number; results: number[] }>();
  const filterCounts = new Map<string, number>();
  const noResultCounts = new Map<string, number>();
  const dailyCounts = new Map<string, number>();

  // Process all search events
  searchEvents.forEach(event => {
    // Count queries
    const queryLower = event.query.toLowerCase();
    if (!queryCounts.has(queryLower)) {
      queryCounts.set(queryLower, { count: 0, results: [] });
    }
    const queryData = queryCounts.get(queryLower)!;
    queryData.count++;
    queryData.results.push(event.resultsCount);

    // Count filter usage
    Object.entries(event.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== false) {
        filterCounts.set(key, (filterCounts.get(key) || 0) + 1);
      }
    });

    // Count no-result queries
    if (event.resultsCount === 0) {
      noResultCounts.set(queryLower, (noResultCounts.get(queryLower) || 0) + 1);
    }

    // Count daily searches
    const date = event.timestamp.split('T')[0];
    dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
  });

  // Calculate popular queries
  const popularQueries = Array.from(queryCounts.entries())
    .map(([query, data]) => ({
      query,
      count: data.count,
      avgResults: Math.round(data.results.reduce((a, b) => a + b, 0) / data.results.length),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate search trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const searchTrends = Array.from(dailyCounts.entries())
    .filter(([date]) => new Date(date) >= thirtyDaysAgo)
    .map(([date, searches]) => ({ date, searches }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate no-result queries
  const noResultQueries = Array.from(noResultCounts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSearches: searchEvents.length,
    popularQueries,
    filterUsage: Object.fromEntries(filterCounts),
    searchTrends,
    noResultQueries,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchEvent = await request.json();

    // Validate required fields
    if (!body.query || !body.timestamp || !body.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: query, timestamp, sessionId' },
        { status: 400 }
      );
    }

    // Add client information
    const event: SearchEvent = {
      ...body,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || undefined,
    };

    // Store the search event
    searchEvents.push(event);

    // Keep only last 10,000 events to prevent memory issues
    if (searchEvents.length > 10000) {
      searchEvents.splice(0, searchEvents.length - 10000);
    }

    // Invalidate cache
    analyticsCache.data = null;
    analyticsCache.lastUpdated = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Return cached data if available and fresh
    if (
      analyticsCache.data &&
      analyticsCache.lastUpdated &&
      new Date(now).getTime() - new Date(analyticsCache.lastUpdated).getTime() < CACHE_DURATION
    ) {
      return NextResponse.json(analyticsCache.data);
    }

    // Generate fresh analytics
    const analytics = generateAnalytics();
    
    // Update cache
    analyticsCache.data = analytics;
    analyticsCache.lastUpdated = now;

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear all search events and cache
    searchEvents.length = 0;
    analyticsCache.data = null;
    analyticsCache.lastUpdated = null;

    return NextResponse.json({ success: true, message: 'Search analytics cleared' });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
