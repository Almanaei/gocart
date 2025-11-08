# Frequently Asked Questions (FAQ)

## General Questions

### Q: Do I need to be technical to set this up?
**A:** Not at all! This guide is written for beginners with zero technical experience. If you can use email and browse the internet, you can set this up.

### Q: How long will this take?
**A:** Most people complete the setup in about 30 minutes. The actual work is just clicking buttons and copying/pasting information.

### Q: What if I make a mistake?
**A:** Don't worry! WordPress makes it easy to change settings. You can always go back and correct anything.

## WordPress Questions

### Q: I can't log in to my WordPress site. Where do I go?
**A:** Your WordPress login page is usually at `yourwebsite.com/wp-admin`. If you're not sure, ask the person who set up your website.

### Q: What if I don't see the "Plugins" menu?
**A:** You might not have administrator access. Contact your website administrator and ask them to give you admin rights.

### Q: I can't find the WooCommerce plugin in the search results.
**A:** Make sure you're searching in the "Plugins → Add New" section, not somewhere else. The exact name is "WooCommerce" with a purple shopping cart icon.

## Plugin Questions

### Q: What is the JWT Authentication plugin for?
**A:** It's like a security guard that lets your store and WordPress website talk to each other safely. It's required for the connection to work.

### Q: I installed the JWT plugin but don't see the "JWT Auth" settings.
**A:** Try looking under "Settings" in the left menu. If you still don't see it, try deactivating and reactivating the plugin.

### Q: What does "CORS Support" mean?
**A:** It's a technical setting that allows your store to connect to WordPress. Just make sure it's checked - you don't need to understand what it does.

## API Keys Questions

### Q: What are API keys and why do I need them?
**A:** Think of API keys like special passwords that let your store access your WordPress product information. They're safe to use because they only give access to specific information.

### Q: I lost my API keys. How do I get them again?
**A:** You can't see the secret keys again after you generate them. You'll need to create a new API key:
1. Go to WooCommerce → Settings → Advanced
2. Under "REST API", find your old key and click "Revoke"
3. Click "Add API key" and create a new one
4. Use the new keys in your configuration

### Q: Do I need to keep my API keys secret?
**A:** Yes! Treat them like passwords. Don't share them publicly or post them online.

## Configuration Questions

### Q: What is the `.env.local` file?
**A:** It's a configuration file that tells your store how to connect to WordPress. It's like giving your store directions to find your products.

### Q: I can't find the `.env.local.example` file.
**A:** Look in the main folder of your store files. If you still can't find it, ask your developer to help you locate it.

### Q: Do I need to include `https://` in my website URL?
**A:** Yes! The URL must include `https://` at the beginning. For example: `https://yourstore.com` (not just `yourstore.com`).

## Product Questions

### Q: How many products do I need to add?
**A:** Start with 3-4 products so you can see how your store looks. You can always add more later.

### Q: Do I need to add product images?
**A:** Yes! Products with images look much better and sell more. Click "Add product image" when creating a product.

### Q: What should I put in the product description?
**A:** Write a description that tells customers why they should buy your product. Include details like size, color, materials, and benefits.

## Testing Questions

### Q: I set everything up but don't see any products. What's wrong?
**A:** Check these things:
1. Are your products published in WordPress? (They should say "Published" not "Draft")
2. Did you save your `.env.local` file with the correct information?
3. Is your website URL correct in the configuration?

### Q: The products show but I can't add them to cart. What should I do?
**A:** This usually means the API keys aren't working. Double-check that you copied them exactly and that you selected "Read/Write" permissions.

### Q: Do I need to pay anything when testing?
**A:** No! You can test the entire checkout process without actually paying. Just stop before entering real payment information.

## Troubleshooting

### Q: I get an error message that says "Connection failed".
**A:** This usually means:
1. Your website URL is incorrect (check for typos)
2. Your API keys are wrong (copy them again)
3. The plugins aren't activated (check Plugins → Installed Plugins)

### Q: My store looks different than the pictures in the guide.
**A:** WordPress updates sometimes change the appearance. The buttons and functions are still the same, they might just look slightly different.

### Q: I'm stuck and don't know what to do.
**A:** Don't worry! Here are your options:
1. Go back one step and try again
2. Contact your website developer
3. Ask for help in the WooCommerce support forums

## Success Questions

### Q: How do I know if everything is working?
**A:** If you can:
- See your products on your store
- Click on a product to see details
- Add products to your cart
- Go through the checkout process

Then everything is working correctly!

### Q: Can I start selling to customers now?
**A:** Yes! Once you've tested everything and it's working, your store is ready for customers.

### Q: What if I want to change something later?
**A:** You can always come back to WordPress to add more products, change prices, or update information. Your store will automatically show the latest changes.

---

Still have questions? Don't hesitate to ask for help. Setting up your first online store is a big step, and we're here to make it as easy as possible!