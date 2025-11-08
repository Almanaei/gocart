# Quick Start Checklist: WordPress Integration

## ✅ Before You Start

- [ ] I have my WordPress login details
- [ ] I have administrator access to my WordPress site
- [ ] I have 30 minutes to complete setup

## ✅ Step 1: Install WooCommerce

- [ ] Log in to WordPress (`yourwebsite.com/wp-admin`)
- [ ] Go to Plugins → Add New
- [ ] Search for "WooCommerce"
- [ ] Click "Install Now" then "Activate"
- [ ] Follow the WooCommerce setup wizard
- [ ] Fill in business information and click "Continue" through all steps

## ✅ Step 2: Install JWT Authentication Plugin

- [ ] Go to Plugins → Add New
- [ ] Search for "JWT Authentication for WP REST API"
- [ ] Click "Install Now" then "Activate"
- [ ] Go to Settings → JWT Auth
- [ ] Click "Generate" for the secret key
- [ ] Copy and save the secret key somewhere safe
- [ ] Check "CORS Support" box
- [ ] Click "Save Changes"

## ✅ Step 3: Configure WordPress Settings

- [ ] Go to Settings → Permalinks
- [ ] Select "Post name"
- [ ] Click "Save Changes"
- [ ] Go to WooCommerce → Settings → Advanced
- [ ] Make sure "Enable REST API" is checked
- [ ] Click "Save Changes"

## ✅ Step 4: Get API Keys

- [ ] Go to WooCommerce → Settings → Advanced
- [ ] Under "REST API", click "Add API key"
- [ ] Enter "Store Frontend" as description
- [ ] Select "Read/Write" permissions
- [ ] Click "Generate API key"
- [ ] Copy and save both Consumer Key and Consumer Secret

## ✅ Step 5: Configure Your Store

- [ ] Find the `.env.local.example` file
- [ ] Make a copy and rename it to `.env.local`
- [ ] Replace the example values with your actual information:
  - `WORDPRESS_URL` = your website address (with https://)
  - `WOOCOMMERCE_CONSUMER_KEY` = your Consumer Key
  - `WOOCOMMERCE_CONSUMER_SECRET` = your Consumer Secret
  - `JWT_AUTH_SECRET_KEY` = your JWT Secret Key
- [ ] Save the file

## ✅ Step 6: Add Products

- [ ] Go to Products → Add New
- [ ] Fill in product name, description, and price
- [ ] Add a product image
- [ ] Select a category
- [ ] Click "Publish"
- [ ] Repeat for at least 3-4 products

## ✅ Step 7: Test Everything

- [ ] Open your store website
- [ ] Check that products are displayed
- [ ] Try clicking on a product
- [ ] Try adding to cart
- [ ] Go through checkout process

## 🎉 All Done!

Your WordPress store is now connected to your online storefront! Customers can browse and purchase your products.

## Need Help?

If you're stuck:
- Double-check all your keys and URLs
- Make sure all plugins are activated
- Contact your website developer for assistance