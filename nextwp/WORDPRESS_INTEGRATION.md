# WordPress & WooCommerce Integration Guide

This guide will help you integrate your Next.js frontend store with a WordPress backend using WooCommerce.

## 🚀 Quick Start

### 1. Prerequisites

- WordPress site with WooCommerce plugin installed and activated
- WooCommerce REST API keys
- Next.js development environment
- Basic knowledge of WordPress and WooCommerce

### 2. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Configure your WordPress settings in `.env.local`:
   ```env
   # WordPress Configuration
   NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com

   # WooCommerce REST API Keys
   WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
   WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here

   # Optional: WordPress Application Passwords
   WORDPRESS_USERNAME=your_username
   WORDPRESS_APPLICATION_PASSWORD=your_app_password
   ```

### 3. Install Required WordPress Plugins

Install these plugins on your WordPress site:

- **WooCommerce** (required)
- **JWT Authentication for WP REST API** (for user authentication)
- **WooCommerce REST API** (included with WooCommerce)
- **WP REST Menus** (for navigation menus)
- **YITH WooCommerce Wishlist** (optional, for wishlist functionality)

## 🔑 WooCommerce REST API Setup

### 1. Generate API Keys

1. Go to your WordPress admin dashboard
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **"Add key"**
4. Enter a description (e.g., "Next.js Frontend")
5. Set permissions to **"Read/Write"**
6. Copy the **Consumer Key** and **Consumer Secret** to your `.env.local`

### 2. Enable REST API

Ensure the WooCommerce REST API is enabled:
1. Go to **WooCommerce > Settings > Advanced**
2. Check **"Enable REST API"** under "Legacy API"
3. Save changes

## 📚 API Service Layer

### Core Services

The integration includes these service classes:

#### 1. WordPress API (`src/lib/wordpress.ts`)
- Base WordPress REST API functionality
- WooCommerce specific endpoints
- Authentication handling

#### 2. Product Service (`src/lib/services/productService.ts`)
- Product fetching and filtering
- Category and tag management
- Product search functionality
- Caching for performance

#### 3. Cart Service (`src/lib/services/cartService.ts`)
- Cart operations (add, update, remove items)
- Cart validation
- Shipping calculations
- Coupon management

#### 4. Auth Service (`src/lib/services/authService.ts`)
- User login and registration
- Token management
- Password reset
- Session handling

#### 5. User Service (`src/lib/services/userService.ts`)
- User profile management
- Order history
- Address management
- Wishlist functionality

### Usage Examples

#### Fetching Products

```typescript
import { productService } from '@/lib/services/productService';

// Get all products
const products = await productService.getProducts({
  per_page: 12,
  page: 1
});

// Get featured products
const featuredProducts = await productService.getFeaturedProducts(8);

// Search products
const searchResults = await productService.searchProducts('wireless headphones');

// Get products by category
const categoryProducts = await productService.getProductsByCategory(15, {
  per_page: 20
});
```

#### Cart Operations

```typescript
import { cartService } from '@/lib/services/cartService';

// Add to cart
const cart = await cartService.addToCart(123, 1); // product ID, quantity

// Update cart item
const updatedCart = await cartService.updateCartItem('item_key', 2);

// Remove from cart
const cartAfterRemove = await cartService.removeCartItem('item_key');

// Get cart summary
const summary = await cartService.getCartSummary();
```

#### User Authentication

```typescript
import { authService } from '@/lib/services/authService';

// Login
const result = await authService.login({
  username: 'user@example.com',
  password: 'password123'
});

// Register
const registerResult = await authService.register({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'password123'
});

// Check if authenticated
const isAuthenticated = await authService.isAuthenticated();
```

## 🎨 Component Integration

### 1. Update Existing Components

Replace mock data with API calls:

#### Header Component

```typescript
// In src/components/Header.tsx
import { cartService } from '@/lib/services/cartService';

// Get cart count for header badge
const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  const fetchCartCount = async () => {
    const summary = await cartService.getCartSummary();
    setCartCount(summary.itemCount);
  };
  
  fetchCartCount();
}, []);
```

#### Product List Component

```typescript
// In src/components/ProductList.tsx
import { productService } from '@/lib/services/productService';

const [products, setProducts] = useState<WooCommerceProduct[]>([]);

useEffect(() => {
  const fetchProducts = async () => {
    const fetchedProducts = await productService.getProducts({
      per_page: 12,
      status: 'publish'
    });
    setProducts(fetchedProducts);
  };
  
  fetchProducts();
}, []);
```

### 2. Create New API-Driven Components

#### Product Card Component

```typescript
// src/components/ProductCard.tsx
import { WooCommerceProduct } from '@/types/wordpress';
import { productService } from '@/lib/services/productService';
import { cartService } from '@/lib/services/cartService';

interface ProductCardProps {
  product: WooCommerceProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = async () => {
    try {
      await cartService.addToCart(product.id, 1);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300">
      {/* Product content */}
      <Button onClick={handleAddToCart}>
        Add to Cart
      </Button>
    </Card>
  );
}
```

#### Category Navigation Component

```typescript
// src/components/CategoryNavigation.tsx
import { productService } from '@/lib/services/productService';

export default async function CategoryNavigation() {
  const categories = await productService.getAllCategories();
  
  return (
    <nav>
      {categories.map(category => (
        <a key={category.id} href={`/category/${category.slug}`}>
          {category.name}
        </a>
      ))}
    </nav>
  );
}
```

## 🔧 Advanced Configuration

### 1. Caching Strategy

The services implement caching for better performance:

- **Product Cache**: 5 minutes
- **Category Cache**: 5 minutes
- **Cart Cache**: 30 seconds
- **User Data**: Stored in localStorage

To clear all caches:
```typescript
import { productService, cartService } from '@/lib/services';

productService.clearCache();
cartService.clearCache();
```

### 2. Error Handling

All services include error handling. You can customize this:

```typescript
try {
  const products = await productService.getProducts();
} catch (error) {
  // Handle error (show toast, redirect, etc.)
  console.error('Failed to fetch products:', error);
}
```

### 3. Custom API Endpoints

For custom functionality, you can extend the API services:

```typescript
// In src/lib/wordpress.ts
class CustomWordPressAPI extends WooCommerceAPI {
  async getCustomData() {
    const endpoint = '/wp-json/custom/v1/data';
    return this.request(endpoint);
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
If you encounter CORS errors, add this to your WordPress theme's `functions.php`:

```php
// Enable CORS
add_action('init', 'handle_preflight');
function handle_preflight() {
    $origin = get_http_origin();
    if ($origin) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
    }
    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
}
```

#### 2. Authentication Issues
- Ensure JWT Authentication plugin is installed and activated
- Check that API keys have correct permissions
- Verify WordPress URLs in environment configuration

#### 3. 404 Errors
- Ensure WooCommerce REST API is enabled
- Check that endpoints exist in your WordPress installation
- Verify plugin compatibility

#### 4. Performance Issues
- Enable caching in services
- Use pagination for large product lists
- Optimize images on WordPress side

### Debug Mode

Enable debug logging:

```typescript
// In development, add this to your service calls
console.log('API Request:', { endpoint, params });
console.log('API Response:', data);
```

## 📱 Mobile Responsiveness

The frontend is fully responsive and works with WordPress data:

- Mobile-first design
- Touch-friendly interactions
- Optimized for all screen sizes
- Fast loading with proper image handling

## 🔒 Security Considerations

### 1. API Key Security
- Never expose API keys in client-side code
- Use environment variables
- Rotate keys periodically
- Use HTTPS only

### 2. User Authentication
- Use JWT tokens for secure authentication
- Implement token expiration
- Store tokens securely (httpOnly cookies recommended)
- Validate all user inputs

### 3. Rate Limiting
Implement rate limiting on WordPress side:

```php
// Add to functions.php
add_filter('woocommerce_rest_check_permissions', 'limit_api_requests', 10, 3);
function limit_api_requests($permission, $context, $post_id) {
    // Implement rate limiting logic here
    return $permission;
}
```

## 🚀 Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Environment Configuration
Set up production environment variables on your hosting platform.

### 3. WordPress Configuration
Ensure your WordPress site is production-ready:
- Updated plugins and themes
- Security hardening
- Backup solutions
- CDN configuration

### 4. Testing
Test all integrations before going live:
- Product fetching
- Cart operations
- User authentication
- Checkout process
- Order management

## 📞 Support

For issues and questions:

1. Check this documentation
2. Review WordPress and WooCommerce documentation
3. Test API endpoints using tools like Postman
4. Check browser console for errors

## 📈 Performance Optimization

### 1. Caching
- Enable WordPress caching plugins (WP Rocket, W3 Total Cache)
- Use CDN for static assets
- Implement browser caching

### 2. Database Optimization
- Optimize WordPress database
- Use indexing for better query performance
- Clean up unused data

### 3. Image Optimization
- Use WordPress image optimization plugins
- Implement lazy loading
- Use next-gen image formats

---

This integration provides a complete solution for connecting your Next.js frontend with WordPress and WooCommerce. The modular architecture makes it easy to extend and customize based on your specific needs.