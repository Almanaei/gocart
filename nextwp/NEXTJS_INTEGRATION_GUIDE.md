# Next.js Integration Guide for WordPress

This guide explains what you need to do on the Next.js side to complete the WordPress integration.

## Overview

Your Next.js app is already built with all the components and functionality needed. The main integration task is configuring it to connect to your WordPress site. Here's what you need to do:

## Step 1: Set Up Environment Variables

### 1.1 Create the Environment File

1. **Find the example file**
   - Look for `.env.local.example` in your project root
   - This file contains all the environment variables you need to configure

2. **Create your environment file**
   - Copy `.env.local.example` to a new file named `.env.local`
   - This file will contain your actual WordPress connection details

### 1.2 Configure the Variables

Open `.env.local` and replace the placeholder values with your actual WordPress information:

```env
# Your WordPress site URL (include https://)
WORDPRESS_URL=https://your-wordpress-site.com

# WooCommerce API Keys
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here

# JWT Authentication Secret Key
JWT_AUTH_SECRET_KEY=your_jwt_secret_key_here
```

**Important:**
- Include `https://` in your WordPress URL
- Copy the keys exactly as they appear in WordPress (no extra spaces)
- The `.env.local` file should be in your project root directory

## Step 2: Verify the Integration Services

Your Next.js app already has the integration services set up. Let's verify they're correctly configured:

### 2.1 WordPress API Service

Check `src/lib/wordpress.ts`:

```typescript
// This should already be configured to use your environment variables
const WORDPRESS_URL = process.env.WORDPRESS_URL || '';
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
```

### 2.2 Authentication Service

Check `src/lib/auth.ts`:

```typescript
// This should be configured to use JWT authentication
const JWT_SECRET = process.env.JWT_AUTH_SECRET_KEY || '';
```

## Step 3: Test the Connection

### 3.1 Start the Development Server

```bash
npm run dev
```

### 3.2 Check the Connection

1. **Open your browser** to `http://localhost:3000`
2. **Look for products** - they should appear from WordPress
3. **Check the browser console** for any connection errors

### 3.3 Troubleshooting Connection Issues

If products don't appear, check:

1. **Environment Variables**
   - Make sure `.env.local` exists and has correct values
   - Verify no typos in the URL or API keys

2. **WordPress Configuration**
   - Ensure WooCommerce REST API is enabled
   - Verify JWT Authentication plugin is active
   - Check that CORS support is enabled

3. **Network Issues**
   - Make sure your WordPress site is accessible
   - Check for any firewall or security plugin blocking API requests

## Step 4: Verify API Endpoints

Your Next.js app includes several API endpoints that communicate with WordPress:

### 4.1 Product API

- **Endpoint**: `/api/products`
- **Function**: Fetches products from WordPress
- **Test**: Visit `/api/products` in your browser to see if products are returned

### 4.2 Authentication API

- **Endpoint**: `/api/auth/login`
- **Function**: Handles user login with WordPress credentials
- **Test**: Try logging in with a WordPress user account

### 4.3 Cart API

- **Endpoint**: `/api/cart`
- **Function**: Manages shopping cart operations
- **Test**: Add a product to cart and check if it persists

## Step 5: Configure the Frontend Components

The frontend components are already built to work with WordPress. Here's what they do:

### 5.1 Product Components

- **ProductList**: Displays products fetched from WordPress
- **ProductDetail**: Shows individual product details
- **ProductCard**: Product card for grid/list views

### 5.2 User Components

- **LoginForm**: Authenticates against WordPress users
- **RegisterForm**: Creates new WordPress users
- **AccountDashboard**: Shows user profile and orders

### 5.3 Cart Components

- **CartSidebar**: Displays cart contents
- **CheckoutForm**: Handles order processing
- **OrderConfirmation**: Shows completed orders

## Step 6: Test the Full Flow

### 6.1 User Journey Test

1. **Browse Products**
   - Navigate to the home page
   - Verify products are displayed from WordPress
   - Click on a product to see details

2. **User Registration/Login**
   - Try to register a new account
   - Verify the account is created in WordPress
   - Try logging in with WordPress credentials

3. **Add to Cart**
   - Add a product to cart
   - Verify cart updates correctly
   - Check cart persistence across page reloads

4. **Checkout Process**
   - Proceed to checkout
   - Fill in shipping and billing details
   - Complete the order process
   - Verify order is created in WordPress

### 6.2 Admin Verification

1. **Check WordPress Admin**
   - Log in to WordPress admin
   - Verify new user accounts appear
   - Check that orders are created in WooCommerce
   - Confirm product inventory is updated

## Step 7: Production Deployment

### 7.1 Set Production Environment Variables

When deploying, make sure to set the environment variables in your hosting platform:

```env
WORDPRESS_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here
JWT_AUTH_SECRET_KEY=your_jwt_secret_key_here
```

### 7.2 Build and Deploy

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Step 8: Common Issues and Solutions

### 8.1 CORS Errors

**Problem**: Browser shows CORS errors when making API requests.

**Solution**:
1. In WordPress admin, go to Settings → JWT Auth
2. Make sure "CORS Support" is checked
3. Add your Next.js domain to the allowed origins if needed

### 8.2 Authentication Failures

**Problem**: Users can't log in or register.

**Solution**:
1. Verify JWT secret key is correct in `.env.local`
2. Check that WordPress permalinks are set to "Post name"
3. Ensure JWT Authentication plugin is active

### 8.3 Products Not Loading

**Problem**: Products don't appear on the frontend.

**Solution**:
1. Verify WooCommerce API keys are correct
2. Check that REST API is enabled in WooCommerce
3. Ensure products are published in WordPress (not draft)

### 8.4 Cart Issues

**Problem**: Cart items disappear or don't persist.

**Solution**:
1. Check browser console for JavaScript errors
2. Verify API endpoints are responding correctly
3. Ensure user is authenticated for cart persistence

## Step 9: Advanced Configuration (Optional)

### 9.1 Custom API Endpoints

If you need additional WordPress functionality:

1. **Create new API route** in `src/app/api/`
2. **Use the WordPress service** to fetch data
3. **Add corresponding frontend component** to display data

### 9.2 Custom Product Fields

If you have custom product fields in WordPress:

1. **Update the TypeScript types** in `src/types/wordpress.ts`
2. **Modify the product service** to fetch custom fields
3. **Update product components** to display custom fields

### 9.3 Custom Authentication

If you need custom authentication flows:

1. **Extend the auth service** in `src/lib/auth.ts`
2. **Add new API endpoints** for auth operations
3. **Update auth components** to handle custom flows

## Step 10: Final Checklist

Before going live, verify:

- [ ] `.env.local` is configured with correct WordPress details
- [ ] All environment variables are set in production
- [ ] Products are loading from WordPress
- [ ] User authentication works with WordPress accounts
- [ ] Cart and checkout functions correctly
- [ ] Orders are created in WordPress
- [ ] No console errors in browser
- [ ] Responsive design works on all devices
- [ ] Performance is optimized

---

## Conclusion

Your Next.js app is fully integrated with WordPress! The main steps were:

1. **Configure environment variables** with WordPress connection details
2. **Test the connection** to ensure API communication works
3. **Verify all components** are working with WordPress data
4. **Test the complete user journey** from browsing to checkout
5. **Deploy with proper environment configuration**

The integration is now complete and your Next.js storefront is ready to work with your WordPress backend!