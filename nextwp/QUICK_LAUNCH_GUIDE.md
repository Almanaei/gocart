# Quick Launch Guide: Get Your Store Live in 30 Minutes

## The Fast Track to Going Live

This guide assumes you've already set up WordPress with WooCommerce and have your Next.js app ready. We're focusing on deployment only.

## Step 1: Choose Your Deployment Strategy (2 minutes)

### Option A: Vercel (Recommended for Beginners)
**Pros**: Free, automatic deployments, made for Next.js
**Time**: 5 minutes

### Option B: Netlify
**Pros**: Free, good for static sites
**Time**: 5 minutes

### Option C: Traditional Hosting
**Pros**: You already have hosting
**Time**: 15-20 minutes

## Step 2: Prepare Your Code (3 minutes)

```bash
# Make sure you're in your project directory
cd /path/to/your/project

# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repository first, then:
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## Step 3A: Deploy to Vercel (5 minutes)

### 1. Sign Up and Deploy
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub (free)
- Click "New Project"
- Select your GitHub repository
- Click "Deploy"

### 2. Configure Environment Variables
- After deployment, go to your project dashboard
- Click "Settings" → "Environment Variables"
- Add these variables:
  ```
  WORDPRESS_URL = https://your-wordpress-site.com
  WOOCOMMERCE_CONSUMER_KEY = ck_your_key_here
  WOOCOMMERCE_CONSUMER_SECRET = cs_your_secret_here
  JWT_AUTH_SECRET_KEY = your_jwt_secret_here
  ```
- Click "Save"

### 3. Redeploy
- Vercel will automatically redeploy
- Wait for deployment to complete (2-3 minutes)

## Step 3B: Deploy to Netlify (5 minutes)

### 1. Sign Up and Deploy
- Go to [netlify.com](https://netlify.com)
- Sign up with GitHub (free)
- Click "New site from Git"
- Select your GitHub repository
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
- Click "Deploy site"

### 2. Configure Environment Variables
- Go to "Site settings"
- Click "Build & deploy" → "Environment"
- Add the same environment variables as above
- Click "Save"

### 3. Trigger Redeploy
- Netlify will automatically redeploy
- Wait for deployment to complete

## Step 4: Configure Your Domain (5 minutes)

### Option 1: Use Provided Domain (Easiest)
- Vercel: Your site is at `your-project.vercel.app`
- Netlify: Your site is at `your-project.netlify.app`
- **You're done!** Skip to Step 6

### Option 2: Use Custom Domain
- In your hosting provider dashboard:
  - Go to DNS settings
  - Add CNAME record: `www → cname.vercel-dns.com` (for Vercel)
  - Or `www → your-project.netlify.app` (for Netlify)
- In Vercel/Netlify dashboard:
  - Go to domain settings
  - Add your custom domain
  - Wait for DNS to propagate (5-10 minutes)

## Step 5: Configure WordPress (5 minutes)

### 1. Update CORS Settings
- Log in to WordPress admin
- Go to Settings → JWT Auth
- Add your new Next.js domain to allowed origins:
  ```
  https://your-project.vercel.app
  ```
  or
  ```
  https://your-custom-domain.com
  ```
- Ensure "CORS Support" is checked
- Click "Save Changes"

### 2. Test API Access
- In your browser, visit: `https://your-wordpress-site.com/wp-json/wc/v3/products`
- You should see JSON output (not an error)

## Step 6: Final Testing (5 minutes)

### 1. Test Your Live Site
- Open your new Next.js URL
- Verify products appear from WordPress
- Test user registration/login
- Test add to cart
- Test checkout process

### 2. Verify WordPress Integration
- Log in to WordPress admin
- Check that new users appear when they register
- Verify test orders appear when customers buy

## Step 7: Go Live! (2 minutes)

### 1. Remove Maintenance Mode
- If you have a maintenance mode plugin in WordPress, disable it
- Your site is now live!

### 2. Celebrate! 🎉
- You now have a professional e-commerce site
- Next.js frontend + WordPress backend
- Modern, fast, and secure

## Troubleshooting Common Issues

### Products Don't Appear
**Problem**: No products show on your live site
**Solution**:
- Check environment variables are correct
- Verify WordPress REST API is accessible
- Ensure CORS is configured in WordPress

### CORS Errors
**Problem**: Browser shows CORS errors
**Solution**:
- In WordPress JWT Auth settings, add your Next.js domain
- Ensure "CORS Support" is checked
- Clear browser cache and retry

### Build Fails
**Problem**: Deployment fails with errors
**Solution**:
- Check deployment logs for specific error
- Ensure all dependencies are in package.json
- Verify code works locally before deploying

### Authentication Fails
**Problem**: Users can't log in
**Solution**:
- Verify JWT secret key is correct
- Check WordPress permalinks are set to "Post name"
- Ensure JWT plugin is active

## What You've Accomplished

✅ **Professional E-commerce Site**: Next.js frontend + WordPress backend  
✅ **Modern Architecture**: Separated frontend and backend  
✅ **Scalable Solution**: Can handle growth and traffic  
✅ **Secure Setup**: Proper authentication and CORS configuration  
✅ **Easy Maintenance**: WordPress admin for content management  

## Next Steps (Optional)

1. **Set Up Analytics**: Add Google Analytics or similar
2. **Configure Email**: Set up transactional emails
3. **Add Products**: Add more products to WordPress
4. **Customize Design**: Modify Tailwind CSS classes
5. **Set Up Backups**: Regular WordPress backups

---

## You're Done! 🎉

Your store is now live with:
- **Fast, modern frontend** built with Next.js
- **Powerful backend** managed through WordPress
- **Secure integration** between frontend and backend
- **Professional shopping experience** for your customers

The hard work is done - now you can focus on growing your business!