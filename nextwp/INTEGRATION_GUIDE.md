# WordPress Integration Guide for Beginners

This guide will help you connect your WordPress site to your new online store. Don't worry if you're not technical - we'll walk you through every step!

## What You'll Need

Before we start, make sure you have:
- A WordPress website (if you don't have one, you can create one at wordpress.com)
- Administrator access to your WordPress site
- About 30 minutes to complete the setup

## Step 1: Install WooCommerce (Your Online Store)

1. **Log in to your WordPress site**
   - Go to your website's login page (usually `yourwebsite.com/wp-admin`)
   - Enter your username and password
   - Click "Log In"

2. **Install WooCommerce**
   - On the left side menu, click "Plugins"
   - Click "Add New" at the top of the page
   - In the search box on the right, type "WooCommerce"
   - Find the WooCommerce plugin (it has a purple icon) and click "Install Now"
   - After it installs, click "Activate"

3. **Set Up Your Store**
   - WooCommerce will show you a setup wizard
   - Click "Let's Go!" to start
   - Fill in your business information (address, currency, etc.)
   - Choose what you'll be selling
   - Click "Continue" through each step
   - When finished, click "Return to dashboard"

## Step 2: Install the REST API Plugin

1. **Install the Plugin**
   - On the left menu, click "Plugins"
   - Click "Add New"
   - In the search box, type "JWT Authentication"
   - Find the "JWT Authentication for WP REST API" plugin and click "Install Now"
   - After it installs, click "Activate"

2. **Configure the Plugin**
   - On the left menu, click "Settings"
   - Click "JWT Auth" (it might be under "General" or have its own tab)
   - You'll see a field called "JWT Auth Secret Key"
   - Click the "Generate" button to create a secret key
   - Copy this key and save it somewhere safe (you'll need it later)
   - Make sure the "CORS Support" option is checked
   - Click "Save Changes"

## Step 3: Enable API Access

1. **Enable Permalinks**
   - On the left menu, click "Settings"
   - Click "Permalinks"
   - Select "Post name" (this is important for the API to work)
   - Click "Save Changes"

2. **Update Your Website Configuration**
   - On the left menu, click "WooCommerce"
   - Click "Settings"
   - Click the "Advanced" tab
   - Under "REST API", make sure "Enable REST API" is checked
   - Click "Save Changes"

## Step 4: Get Your Website Information

1. **Find Your Website URL**
   - In your browser's address bar, copy your website address
   - It should look like: `https://yourwebsite.com` (include the https://)

2. **Get Your API Keys**
   - On the left menu, click "WooCommerce"
   - Click "Settings"
   - Click the "Advanced" tab
   - Under "REST API", click "Add API key"
   - Enter a description like "Store Frontend"
   - Select "Read/Write" permissions
   - Click "Generate API key"
   - Copy the Consumer Key and Consumer Secret
   - Save these keys somewhere safe (you'll need them next)

## Step 5: Connect to Your Store

1. **Open the Configuration File**
   - Go to your store's files (you might need help from a developer for this step)
   - Find the file called `.env.local.example`
   - Make a copy of this file and rename it to `.env.local`

2. **Add Your Website Information**
   - Open the `.env.local` file
   - Replace the example information with your actual website details:
   
   ```
   WORDPRESS_URL=https://yourwebsite.com
   WOOCOMMERCE_CONSUMER_KEY=your-consumer-key-here
   WOOCOMMERCE_CONSUMER_SECRET=your-consumer-secret-here
   JWT_AUTH_SECRET_KEY=your-jwt-secret-key-here
   ```

   Replace:
   - `https://yourwebsite.com` with your actual website URL
   - `your-consumer-key-here` with the Consumer Key you copied
   - `your-consumer-secret-here` with the Consumer Secret you copied
   - `your-jwt-secret-key-here` with the JWT Secret Key you saved

3. **Save the File**
   - Save the `.env.local` file
   - If you're working with a developer, send them this file

## Step 6: Add Products to Your Store

1. **Add Your First Product**
   - On the left menu, click "Products"
   - Click "Add New"
   - Fill in your product details:
     - **Product name**: What you're selling
     - **Description**: Tell customers about your product
     - **Price**: How much it costs
     - **Product image**: Add a photo of your product
   - In the "Product Data" section:
     - Make sure "Simple product" is selected
     - Set your price in the "Regular price" field
   - On the right side, under "Product Categories", add a category for your product
   - Click "Publish" to make your product live

2. **Add More Products**
   - Repeat the above steps for each product you want to sell
   - Try to add at least 3-4 products to see how your store looks

## Step 7: Test Your Connection

1. **Check Your Store**
   - Open your online store website
   - You should see your products displayed
   - Try clicking on a product to see its details
   - Try adding a product to your cart
   - Go through the checkout process (you won't need to pay anything to test)

## Troubleshooting

If something doesn't work:

1. **Check Your Website URL**
   - Make sure you included `https://` at the beginning
   - Make sure there's no `/wp-admin` at the end

2. **Check Your API Keys**
   - Make sure you copied the keys exactly as they appear
   - Check for any extra spaces before or after the keys

3. **Still Having Problems?**
   - Make sure all plugins are activated
   - Check that your permalinks are set to "Post name"
   - Try deactivating and reactivating the plugins

## Getting Help

If you need help:
- Contact your website developer
- Visit the WooCommerce support forums
- Check the WordPress documentation

Congratulations! You've successfully connected your WordPress site to your online store. Your customers can now browse your products and make purchases through your beautiful new storefront!