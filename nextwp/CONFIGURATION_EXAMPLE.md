# Configuration Example: Next.js + WordPress

## Before and After Example

### BEFORE: Your `.env.local.example` file looks like this:

```env
# WordPress Configuration
WORDPRESS_URL=https://your-wordpress-site.com

# WooCommerce API Keys
WOOCOMMERCE_CONSUMER_KEY=your-consumer-key-here
WOOCOMMERCE_CONSUMER_SECRET=your-consumer-secret-here

# JWT Authentication
JWT_AUTH_SECRET_KEY=your-jwt-secret-key-here
```

### AFTER: Your `.env.local` file should look like this:

```env
# WordPress Configuration
WORDPRESS_URL=https://mystore.com

# WooCommerce API Keys
WOOCOMMERCE_CONSUMER_KEY=ck_123456789abcdef123456789abcdef
WOOCOMMERCE_CONSUMER_SECRET=cs_987654321fedcba987654321fedcba

# JWT Authentication
JWT_AUTH_SECRET_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
```

## What Each Line Does

### 1. WORDPRESS_URL
- **What it is**: Your WordPress website address
- **Example value**: `https://mystore.com`
- **Must include**: `https://` at the beginning
- **Must NOT include**: `/wp-admin` at the end

### 2. WOOCOMMERCE_CONSUMER_KEY
- **What it is**: API key that lets Next.js read your products
- **Example value**: `ck_123456789abcdef123456789abcdef`
- **Where to get it**: WooCommerce → Settings → Advanced → REST API
- **Starts with**: `ck_`

### 3. WOOCOMMERCE_CONSUMER_SECRET
- **What it is**: Secret password for the API key
- **Example value**: `cs_987654321fedcba987654321fedcba`
- **Where to get it**: Same place as Consumer Key
- **Starts with**: `cs_`

### 4. JWT_AUTH_SECRET_KEY
- **What it is**: Security key for user authentication
- **Example value**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9`
- **Where to get it**: Settings → JWT Auth → Generate button
- **Format**: Long string of random characters

## How to Get These Values

### Step 1: Get Your WordPress URL
```
Go to: https://your-website.com/wp-admin
Look at browser address bar: https://your-website.com/wp-admin
Your URL is: https://your-website.com
```

### Step 2: Get WooCommerce API Keys
```
Go to: WooCommerce → Settings → Advanced
Click: "Add API key"
Fill in: Description = "Store Frontend"
Select: "Read/Write" permissions
Click: "Generate API key"
Copy: Consumer Key (starts with ck_)
Copy: Consumer Secret (starts with cs_)
```

### Step 3: Get JWT Secret Key
```
Go to: Settings → JWT Auth
Click: "Generate" button
Copy: The long secret key
Make sure: "CORS Support" is checked
Click: "Save Changes"
```

## File Location

```
your-project/
├── .env.local.example    ← This is the template
├── .env.local           ← This is what you create and edit
├── src/
├── public/
└── ... other files
```

## Testing Your Configuration

After setting up `.env.local`, test it:

```bash
# Stop the server if running (Ctrl+C)
npm run dev

# Open browser to: http://localhost:3000

# You should see:
# - Products from WordPress
# - Working cart
# - Login functionality
```

## Common Mistakes

### ❌ Wrong:
```env
WORDPRESS_URL=mystore.com  # Missing https://
WORDPRESS_URL=https://mystore.com/wp-admin  # Should not include /wp-admin
WOOCOMMERCE_CONSUMER_KEY=your-consumer-key-here  # Still the placeholder
```

### ✅ Correct:
```env
WORDPRESS_URL=https://mystore.com
WOOCOMMERCE_CONSUMER_KEY=ck_123456789abcdef123456789abcdef
```

## What Happens Next

Once you configure `.env.local` correctly:

1. **Products**: Automatically appear from WordPress
2. **Users**: Can log in with WordPress accounts
3. **Orders**: Get created in WordPress when customers buy
4. **Inventory**: Updates in WordPress when items sell

The Next.js app handles all the communication - you just need to provide the "address book" (the environment variables) so it knows where to find your WordPress site.

---

**Bottom Line**: Edit `.env.local` with your 4 WordPress connection details, and the integration is complete!