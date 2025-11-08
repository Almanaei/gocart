// Test script for WordPress connection
const axios = require('axios');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// WordPress API configuration
const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://webtado.com';
const WC_API_BASE = `${WP_API_URL}/wp-json/wc/v3`;
const CONSUMER_KEY = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || '';

// Create an axios instance for WooCommerce API
const wcApi = axios.create({
  baseURL: WC_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET,
  },
});

// Test functions
async function testConnection() {
  console.log('Testing WordPress connection...');
  console.log(`WordPress URL: ${WP_API_URL}`);

  try {
    // Test basic WordPress site access
    console.log('\n1. Testing basic WordPress site access...');
    const siteResponse = await axios.get(WP_API_URL);
    console.log('✓ WordPress site is accessible');
    console.log(`  Status: ${siteResponse.status}`);
  } catch (error) {
    console.error('✗ Failed to access WordPress site');
    console.error(`  Error: ${error.message}`);
    return;
  }

  try {
    // Test WooCommerce API access
    console.log('\n2. Testing WooCommerce API access...');
    const productsResponse = await wcApi.get('/products', { params: { per_page: 1 } });
    console.log('✓ WooCommerce API is accessible');
    console.log(`  Status: ${productsResponse.status}`);
    console.log(`  Found ${productsResponse.headers['x-wp-total']} products`);
  } catch (error) {
    console.error('✗ Failed to access WooCommerce API');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  Error: ${error.message}`);
    }
    return;
  }

  try {
    // Test fetching products
    console.log('\n3. Testing fetching products...');
    const productsResponse = await wcApi.get('/products', { params: { per_page: 5, featured: true } });
    console.log('✓ Successfully fetched products');
    console.log(`  Found ${productsResponse.data.length} featured products`);
    productsResponse.data.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id}, Price: $${product.price})`);
    });
  } catch (error) {
    console.error('✗ Failed to fetch products');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  Error: ${error.message}`);
    }
  }

  try {
    // Test fetching categories
    console.log('\n4. Testing fetching categories...');
    const categoriesResponse = await wcApi.get('/products/categories', { params: { per_page: 5 } });
    console.log('✓ Successfully fetched categories');
    console.log(`  Found ${categoriesResponse.data.length} categories`);
    categoriesResponse.data.forEach(category => {
      console.log(`  - ${category.name} (ID: ${category.id}, Products: ${category.count})`);
    });
  } catch (error) {
    console.error('✗ Failed to fetch categories');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\nConnection test completed!');
}

// Run the test
testConnection().catch(console.error);
