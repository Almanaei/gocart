# Next.js Quick Setup for WordPress Integration

## The 5-Minute Technical Setup

This is the technical checklist for the Next.js side. Your WordPress site should be ready first.

### Step 1: Environment Configuration (2 minutes)

1. **Copy the environment file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`** with your WordPress details:
   ```env
   WORDPRESS_URL=https://your-wordpress-site.com
   WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
   WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here
   JWT_AUTH_SECRET_KEY=your_jwt_secret_key_here
   ```

### Step 2: Start the Server (1 minute)

```bash
npm run dev
```

### Step 3: Test Integration (2 minutes)

1. **Open** `http://localhost:3000`
2. **Check if products appear** (they should come from WordPress)
3. **Try adding to cart**
4. **Try user login**

### Step 4: Troubleshooting (if needed)

If it doesn't work:
- Check `.env.local` for typos
- Verify WordPress REST API is enabled
- Ensure JWT plugin is active

---

## That's It! 

Your Next.js app is now connected to WordPress. The integration is complete when:
- ✅ Products show up from WordPress
- ✅ Users can log in with WordPress accounts
- ✅ Cart works with WordPress products
- ✅ Orders appear in WordPress admin

The hard work is already done in the code - you just need to provide the connection details!