# Frontend/Backend Setup: Next.js as Public Frontend, WordPress as Backend

## Understanding the Architecture

### What You Want to Achieve

```
┌─────────────────────────────────────────────────────────┐
│                    PUBLIC FACING                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           NEXTJS FRONTEND                       │   │
│  │        (What customers see and use)             │   │
│  │                                                 │   │
│  │  • Homepage                                     │   │
│  │  • Product pages                                │   │
│  │  • Shopping cart                                │   │
│  │  • Checkout process                             │   │
│  │  • User accounts                                │   │
│  │  • Order history                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  URL: https://yourstore.com (public)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                                │
                                │ API Calls (customers never see this)
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     ADMIN ONLY                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          WORDPRESS BACKEND                       │   │
│  │       (What you/admin see and use)               │   │
│  │                                                 │   │
│  │  • Product management                           │   │
│  │  • Order management                             │   │
│  │  • Customer management                          │   │
│  │  • Inventory tracking                          │   │
│  │  • Analytics                                    │   │
│  │  • Settings                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  URL: https://admin.yourstore.com (private)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Points

1. **Customers only interact with Next.js** - they never see WordPress
2. **You/admin only interact with WordPress** - through its admin panel
3. **Data flows between them** through API calls
4. **Two separate URLs** - one public, one private

## Implementation Strategy

### Option 1: Same Domain, Different Paths (Recommended)

```
Public Frontend:  https://yourstore.com
Admin Backend:    https://yourstore.com/wp-admin
```

#### Setup:
1. **Deploy Next.js to main domain** (`yourstore.com`)
2. **Keep WordPress on same domain** but in subdirectory
3. **Configure WordPress** to not interfere with frontend

### Option 2: Subdomain Approach

```
Public Frontend:  https://store.yourstore.com
Admin Backend:    https://admin.yourstore.com
```

#### Setup:
1. **Deploy Next.js to subdomain** (`store.yourstore.com`)
2. **Move WordPress to admin subdomain** (`admin.yourstore.com`)
3. **Configure CORS** between subdomains

### Option 3: Completely Separate Domains

```
Public Frontend:  https://yourstore.com
Admin Backend:    https://yourstore-admin.com
```

#### Setup:
1. **Deploy Next.js to main domain**
2. **Host WordPress on separate domain**
3. **Configure CORS** between domains

## Step-by-Step Implementation Guide

### Step 1: Choose Your Domain Strategy

For this guide, we'll use **Option 1** (same domain, different paths) as it's the most common.

### Step 2: Prepare WordPress for Backend-Only Role

#### 1. Move WordPress to Subdirectory

```bash
# If WordPress is currently in root, move it to /wp-admin
mv public_html/* public_html/wp-admin/
# Or through cPanel File Manager
```

#### 2. Update WordPress Configuration

In `wp-config.php`, add:

```php
define('WP_HOME', 'https://yourstore.com/wp-admin');
define('WP_SITEURL', 'https://yourstore.com/wp-admin');
```

#### 3. Update Permalinks

In WordPress admin:
- Go to Settings → Permalinks
- Set to "Post name"
- Save changes

#### 4. Disable Public Access

Add this to your `.htaccess` file in WordPress directory:

```apache
# Block direct access to WordPress frontend
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /wp-admin/
    
    # Allow admin access
    RewriteCond %{REQUEST_URI} ^/wp-admin/wp-login.php [OR]
    RewriteCond %{REQUEST_URI} ^/wp-admin/wp-admin/ [OR]
    RewriteCond %{REQUEST_URI} ^/wp-admin/admin-ajax.php [OR]
    RewriteCond %{REQUEST_URI} ^/wp-admin/wp-json/
    RewriteRule . - [L]
    
    # Block all other direct access
    RewriteCond %{REQUEST_URI} !^/wp-admin/
    RewriteRule . - [F,L]
</IfModule>
```

### Step 3: Deploy Next.js to Main Domain

#### 1. Build and Deploy

```bash
# Build the application
npm run build

# Deploy to your chosen platform (Vercel, Netlify, etc.)
# Or upload to your hosting
```

#### 2. Configure Environment Variables

On your hosting platform, set:

```env
WORDPRESS_URL=https://yourstore.com/wp-admin
WOOCOMMERCE_CONSUMER_KEY=ck_your_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_secret_here
JWT_AUTH_SECRET_KEY=your_jwt_secret_here
```

#### 3. Set Up Routing

In your Next.js app, ensure you have proper routing:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://yourstore.com/wp-admin/wp-json/:path*'
      }
    ]
  }
}
```

### Step 4: Configure CORS and Security

#### 1. WordPress CORS Configuration

In WordPress admin:
- Go to Settings → JWT Auth
- Add your frontend domain to allowed origins:
  ```
  https://yourstore.com
  ```
- Ensure CORS support is enabled
- Save changes

#### 2. Security Headers

Add this to your WordPress `.htaccess`:

```apache
<IfModule mod_headers.c>
    # Allow CORS from your frontend
    Header set Access-Control-Allow-Origin "https://yourstore.com"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

### Step 5: Test the Setup

#### 1. Frontend Test

- Visit `https://yourstore.com`
- Verify products appear from WordPress
- Test user registration/login
- Test cart and checkout

#### 2. Backend Test

- Visit `https://yourstore.com/wp-admin/wp-admin`
- Log in to WordPress admin
- Verify you can manage products
- Check that orders appear when customers buy

#### 3. Integration Test

- Add product in WordPress admin
- Verify it appears on Next.js frontend
- Create test order through frontend
- Verify it appears in WordPress admin

## Advanced Configuration

### Custom API Endpoints

If you need custom WordPress functionality:

1. **Create custom endpoints** in WordPress:
```php
// In your theme's functions.php
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/endpoint', [
        'methods' => 'GET',
        'callback' => 'custom_endpoint_function',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
});
```

2. **Use in Next.js**:
```javascript
// In your Next.js API route
export default async function handler(req, res) {
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/custom/v1/endpoint`, {
        headers: {
            'Authorization': `Bearer ${req.cookies.token}`
        }
    });
    
    const data = await response.json();
    res.json(data);
}
```

### Caching Strategy

#### 1. WordPress Side
```php
// Add to functions.php
add_action('save_post', 'clear_product_cache');
function clear_product_cache($post_id) {
    if (get_post_type($post_id) === 'product') {
        // Clear cache when product is updated
        delete_transient('all_products');
    }
}
```

#### 2. Next.js Side
```javascript
// In getStaticProps
export async function getStaticProps() {
    const cachedProducts = await cache.get('products');
    
    if (cachedProducts) {
        return { props: { products: cachedProducts }, revalidate: 3600 };
    }
    
    const products = await fetchProducts();
    await cache.set('products', products);
    
    return { props: { products }, revalidate: 3600 };
}
```

### Performance Optimization

#### 1. Image Optimization
```javascript
// next.config.js
module.exports = {
    images: {
        domains: ['yourstore.com'],
        path: 'https://yourstore.com/wp-content/uploads/'
    }
}
```

#### 2. API Optimization
```javascript
// In your WordPress service
export async function getProducts() {
    const cacheKey = 'products';
    const cached = await cache.get(cacheKey);
    
    if (cached) return cached;
    
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products?per_page=50`, {
        headers: getAuthHeaders()
    });
    
    const products = await response.json();
    await cache.set(cacheKey, products, 3600); // Cache for 1 hour
    
    return products;
}
```

## Security Considerations

### 1. Protect WordPress Admin

```apache
# In .htaccess
<Files wp-login.php>
    AuthType Basic
    AuthName "Restricted Area"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
</Files>
```

### 2. Rate Limiting

```php
// In functions.php
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) {
        return $result;
    }
    
    if (!is_user_logged_in()) {
        $ip = $_SERVER['REMOTE_ADDR'];
        $count = get_transient("api_attempts_{$ip}");
        
        if ($count >= 100) {
            return new WP_Error('too_many_requests', 'Too many requests', ['status' => 429]);
        }
        
        set_transient("api_attempts_{$ip}", $count + 1, 3600);
    }
    
    return $result;
});
```

### 3. Secure API Keys

```env
# In .env.local
# Never commit this file to version control
WORDPRESS_URL=https://yourstore.com/wp-admin
WOOCOMMERCE_CONSUMER_KEY=ck_your_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_secret_here
JWT_AUTH_SECRET_KEY=your_jwt_secret_here
```

## Monitoring and Maintenance

### 1. Health Checks

```javascript
// In your Next.js app
export async function getServerSideProps() {
    try {
        const healthCheck = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2`);
        
        if (!healthCheck.ok) {
            return {
                props: { error: 'WordPress backend is down' }
            };
        }
        
        // Continue with normal props
    } catch (error) {
        return {
            props: { error: 'Cannot connect to WordPress backend' }
        };
    }
}
```

### 2. Error Tracking

```javascript
// In your API routes
export default async function handler(req, res) {
    try {
        const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wc/v3/products`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
```

---

## Summary

You now have:

1. **Next.js as the public frontend** - what customers see and interact with
2. **WordPress as the backend** - where you manage products, orders, and customers
3. **Clean separation** between public-facing and admin interfaces
4. **Secure API communication** between frontend and backend
5. **Professional architecture** that's scalable and maintainable

This setup gives you the best of both worlds: a modern, fast frontend with Next.js and the powerful, familiar admin experience of WordPress.