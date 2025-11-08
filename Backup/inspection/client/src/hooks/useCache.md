# Cache and Prefetch Hooks

## Overview
This module provides React hooks for efficient data caching and prefetching. It includes three main hooks:
- `useCache`: For managing cached data with automatic loading states
- `usePrefetch`: For prefetching data before it's needed
- `useCacheManager`: For managing the cache system globally

## useCache Hook

### Basic Usage
```jsx
function UserProfile({ userId }) {
  const { data, loading, error } = useCache(
    `user-${userId}`,
    () => fetchUserData(userId)
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <div>{data.name}</div>;
}
```

### Advanced Options
```jsx
const {
  data,
  loading,
  error,
  refetch,
  invalidate,
  cacheStats
} = useCache(`user-${userId}`, fetchUserData, {
  enabled: isEnabled,
  prefetch: true,
  prefetchPriority: 'high',
  dependencies: [userId],
  onSuccess: (data) => console.log('Data loaded:', data),
  onError: (error) => console.error('Error:', error),
  retryCount: 3,
  retryDelay: 1000
});
```

### Options
- `enabled`: Boolean to enable/disable the cache (default: true)
- `prefetch`: Enable prefetching (default: false)
- `prefetchPriority`: Priority for prefetch queue ('low', 'normal', 'high')
- `dependencies`: Array of dependencies that trigger refetch
- `onSuccess`: Callback when data is successfully loaded
- `onError`: Callback when an error occurs
- `retryCount`: Number of retry attempts (default: 3)
- `retryDelay`: Delay between retries in ms (default: 1000)

## usePrefetch Hook

### Usage
```jsx
function App() {
  const { prefetch, cancelPrefetch, clearPrefetchQueue } = usePrefetch();

  // Prefetch user data
  useEffect(() => {
    prefetch(
      'user-1',
      () => fetchUserData(1),
      'high'
    );
  }, []);

  return <div>...</div>;
}
```

## useCacheManager Hook

### Usage
```jsx
function CacheControl() {
  const { clearCache, getStats } = useCacheManager();

  return (
    <div>
      <button onClick={clearCache}>Clear Cache</button>
      <div>
        Cache Stats: {JSON.stringify(getStats())}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Key Management
```jsx
// Good - unique and descriptive keys
const key = `user-${userId}-posts-${postId}`;

// Bad - non-unique or vague keys
const key = 'data';
```

### 2. Error Handling
```jsx
function UserData({ userId }) {
  const { data, error, refetch } = useCache(
    `user-${userId}`,
    fetchUserData,
    {
      onError: (error) => {
        notifyError(error);
        logErrorToService(error);
      }
    }
  );

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={refetch}
      />
    );
  }

  return <UserView data={data} />;
}
```

### 3. Prefetching Strategy
```jsx
function UserList() {
  const { prefetch } = usePrefetch();

  // Prefetch next page when hovering
  const handleRowHover = useCallback((userId) => {
    prefetch(
      `user-${userId}`,
      () => fetchUserDetails(userId),
      'low'
    );
  }, []);

  return <div>...</div>;
}
```

### 4. Cache Invalidation
```jsx
function UserEditor({ userId }) {
  const { invalidate } = useCache(`user-${userId}`, fetchUserData);

  const handleUserUpdate = async (data) => {
    await updateUser(data);
    // Invalidate cache after update
    invalidate();
  };

  return <div>...</div>;
}
```

### 5. Performance Optimization
```jsx
function DataGrid({ items }) {
  const { prefetch } = usePrefetch();

  // Prefetch visible items' details
  useEffect(() => {
    const visibleItems = getVisibleItems(items);
    visibleItems.forEach(item => {
      prefetch(
        `item-${item.id}`,
        () => fetchItemDetails(item.id),
        'normal'
      );
    });
  }, [items]);

  return <div>...</div>;
}
```

## Cache Configuration

The cache system is configured with the following defaults:
- Maximum size: 100MB
- Maximum age: 1 hour
- Cleanup interval: 10 minutes

You can monitor cache usage through the `cacheStats` property returned by `useCache`
or by using the `getStats` method from `useCacheManager`.

## Performance Considerations

1. **Memory Usage**
   - Monitor cache size using `getStats()`
   - Clear unnecessary cache entries
   - Use appropriate cache keys

2. **Network Optimization**
   - Use prefetching for predictable data needs
   - Implement proper retry strategies
   - Cache invalidation on data updates

3. **User Experience**
   - Show loading states
   - Handle errors gracefully
   - Provide retry mechanisms
   - Use prefetching for smoother navigation

## Security Considerations

1. **Sensitive Data**
   - Don't cache sensitive information
   - Clear cache when user logs out
   - Implement proper cache expiration

2. **Data Validation**
   - Validate cached data before use
   - Implement proper error handling
   - Use secure data transmission

## Troubleshooting

### Common Issues

1. **Cache Not Updating**
   - Check if cache key is correct
   - Verify invalidate() is called after updates
   - Check dependencies array

2. **Memory Issues**
   - Monitor cache size
   - Clear unnecessary cache entries
   - Adjust maxSize configuration

3. **Prefetch Not Working**
   - Verify prefetch priority
   - Check network conditions
   - Monitor prefetch queue

### Debugging

Use the following methods for debugging:
```jsx
const { cacheStats } = useCache(key, fetchFn);
console.log('Cache Stats:', cacheStats);

const { getStats } = useCacheManager();
console.log('Global Cache Stats:', getStats());
``` 