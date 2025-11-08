import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface CustomerEmailData {
  customerName: string;
  customerEmail: string;
  type: 'welcome' | 'password_reset' | 'account_verified' | 'loyalty_upgrade';
  data?: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email configuration is available
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };

    // Only initialize if credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;
      console.log('Email service initialized');
    } else {
      console.warn('Email service not configured - missing credentials');
      // In development, we can use a test account
      if (process.env.NODE_ENV === 'development') {
        this.setupTestAccount();
      }
    }
  }

  private async setupTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.isConfigured = true;
      console.log('Test email account created:', testAccount.user);
    } catch (error) {
      console.error('Failed to create test email account:', error);
    }
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: template.from || process.env.EMAIL_FROM || '"NextWP E-commerce" <noreply@nextwp.com>',
        to: Array.isArray(template.to) ? template.to.join(', ') : template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: template.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      // In development, log the preview URL
      if (process.env.NODE_ENV === 'development' && info.messageId) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Email templates
  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    const html = this.generateOrderConfirmationTemplate(orderData);
    const text = this.generateOrderConfirmationText(orderData);

    return this.sendEmail({
      to: orderData.customerEmail,
      subject: `Order Confirmation - #${orderData.orderId}`,
      html,
      text,
    });
  }

  async sendOrderShipped(orderData: OrderEmailData, trackingNumber?: string): Promise<boolean> {
    const html = this.generateOrderShippedTemplate(orderData, trackingNumber);
    const text = this.generateOrderShippedText(orderData, trackingNumber);

    return this.sendEmail({
      to: orderData.customerEmail,
      subject: `Your Order #${orderData.orderId} Has Shipped!`,
      html,
      text,
    });
  }

  async sendCustomerEmail(customerData: CustomerEmailData): Promise<boolean> {
    let html: string;
    let text: string;
    let subject: string;

    switch (customerData.type) {
      case 'welcome':
        html = this.generateWelcomeTemplate(customerData);
        text = this.generateWelcomeText(customerData);
        subject = 'Welcome to NextWP E-commerce!';
        break;
      
      case 'password_reset':
        html = this.generatePasswordResetTemplate(customerData);
        text = this.generatePasswordResetText(customerData);
        subject = 'Password Reset Request';
        break;
      
      case 'account_verified':
        html = this.generateAccountVerifiedTemplate(customerData);
        text = this.generateAccountVerifiedText(customerData);
        subject = 'Your Account Has Been Verified';
        break;
      
      case 'loyalty_upgrade':
        html = this.generateLoyaltyUpgradeTemplate(customerData);
        text = this.generateLoyaltyUpgradeText(customerData);
        subject = 'Congratulations! You\'ve Been Upgraded!';
        break;
      
      default:
        return false;
    }

    return this.sendEmail({
      to: customerData.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendPromotionalEmail(
    recipients: string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: recipients,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }

  // Template generators
  private generateOrderConfirmationTemplate(orderData: OrderEmailData): string {
    const items = orderData.orderItems
      .map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #9333ea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase, ${orderData.customerName}!</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <h2>Order #${orderData.orderId}</h2>
              <p>We've received your order and are preparing it for shipment.</p>
              
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #9333ea;">Product</th>
                    <th style="text-align: center; padding: 12px; border-bottom: 2px solid #9333ea;">Quantity</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #9333ea;">Price</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #9333ea;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #9333ea;">Total:</td>
                    <td style="padding: 12px; text-align: right; border-top: 2px solid #9333ea;" class="total">$${orderData.orderTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              ${orderData.shippingAddress ? `
                <h3>Shipping Address</h3>
                <p>
                  ${orderData.shippingAddress.street}<br>
                  ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}<br>
                  ${orderData.shippingAddress.country}
                </p>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 NextWP E-commerce. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationText(orderData: OrderEmailData): string {
    let text = `Order Confirmation - #${orderData.orderId}\n\n`;
    text += `Thank you for your purchase, ${orderData.customerName}!\n\n`;
    text += `Order Items:\n`;
    
    orderData.orderItems.forEach(item => {
      text += `- ${item.name} (x${item.quantity}) - $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    
    text += `\nTotal: $${orderData.orderTotal.toFixed(2)}\n\n`;
    
    if (orderData.shippingAddress) {
      text += `Shipping Address:\n`;
      text += `${orderData.shippingAddress.street}\n`;
      text += `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}\n`;
      text += `${orderData.shippingAddress.country}\n\n`;
    }
    
    text += `Thank you for shopping with us!\n`;
    text += `NextWP E-commerce`;
    
    return text;
  }

  private generateOrderShippedTemplate(orderData: OrderEmailData, trackingNumber?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .tracking-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order Has Shipped!</h1>
            <p>Good news, ${orderData.customerName}!</p>
          </div>
          
          <div class="content">
            <div class="tracking-info">
              <h2>Order #${orderData.orderId}</h2>
              <p>Your order is on its way! You should receive it within 3-5 business days.</p>
              
              ${trackingNumber ? `
                <h3>Tracking Information</h3>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                <p>You can track your package using the tracking number above.</p>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 NextWP E-commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderShippedText(orderData: OrderEmailData, trackingNumber?: string): string {
    let text = `Your Order Has Shipped! - #${orderData.orderId}\n\n`;
    text += `Good news, ${orderData.customerName}!\n\n`;
    text += `Your order is on its way! You should receive it within 3-5 business days.\n\n`;
    
    if (trackingNumber) {
      text += `Tracking Number: ${trackingNumber}\n`;
      text += `You can track your package using the tracking number above.\n\n`;
    }
    
    text += `Thank you for shopping with us!\n`;
    text += `NextWP E-commerce`;
    
    return text;
  }

  private generateWelcomeTemplate(customerData: CustomerEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #9333ea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .cta-button { display: inline-block; background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to NextWP E-commerce!</h1>
            <p>We're excited to have you with us</p>
          </div>
          
          <div class="content">
            <h2>Hi ${customerData.customerName},</h2>
            <p>Thank you for creating an account with NextWP E-commerce! We're thrilled to have you join our community.</p>
            
            <p>With your new account, you can:</p>
            <ul>
              <li>Track your orders</li>
              <li>Save your shipping addresses</li>
              <li>View your order history</li>
              <li>Get exclusive deals and promotions</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourstore.com'}" class="cta-button">
                Start Shopping
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 NextWP E-commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeText(customerData: CustomerEmailData): string {
    let text = `Welcome to NextWP E-commerce!\n\n`;
    text += `Hi ${customerData.customerName},\n\n`;
    text += `Thank you for creating an account with NextWP E-commerce! We're thrilled to have you join our community.\n\n`;
    text += `With your new account, you can:\n`;
    text += `- Track your orders\n`;
    text += `- Save your shipping addresses\n`;
    text += `- View your order history\n`;
    text += `- Get exclusive deals and promotions\n\n`;
    text += `Start shopping today: ${process.env.NEXT_PUBLIC_APP_URL || 'https://yourstore.com'}\n\n`;
    text += `Best regards,\n`;
    text += `The NextWP E-commerce Team`;
    
    return text;
  }

  private generatePasswordResetTemplate(customerData: CustomerEmailData): string {
    const resetLink = customerData.data?.resetLink || '#';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .reset-button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${customerData.customerName},</h2>
            <p>We received a request to reset your password for your NextWP E-commerce account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">
                Reset Password
              </a>
            </div>
            
            <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email or contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 NextWP E-commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetText(customerData: CustomerEmailData): string {
    const resetLink = customerData.data?.resetLink || '#';
    
    let text = `Password Reset Request\n\n`;
    text += `Hi ${customerData.customerName},\n\n`;
    text += `We received a request to reset your password for your NextWP E-commerce account.\n\n`;
    text += `Click the link below to reset your password:\n`;
    text += `${resetLink}\n\n`;
    text += `Important: This link will expire in 24 hours for security reasons.\n\n`;
    text += `If you didn't request a password reset, please ignore this email or contact our support team.\n\n`;
    text += `Best regards,\n`;
    text += `The NextWP E-commerce Team`;
    
    return text;
  }

  private generateAccountVerifiedTemplate(customerData: CustomerEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verified</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Verified!</h1>
            <p>Your account is now active</p>
          </div>
          
          <div class="content">
            <h2>Hi ${customerData.customerName},</h2>
            <p>Great news! Your NextWP E-commerce account has been successfully verified.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Place orders</li>
              <li>Track your shipments</li>
              <li>Save your preferences</li>
              <li>Get exclusive member benefits</li>
            </ul>
            
            <p>Thank you for verifying your account. We look forward to serving you!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 NextWP E-commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAccountVerifiedText(customerData: CustomerEmailData): string {
    let text = `Account Verified!\n\n`;
    text += `Hi ${customerData.customerName},\n\n`;
    text += `Great news! Your NextWP E-commerce account has been successfully verified.\n\n`;
    text += `You can now:\n`;
    text += `- Place orders\n`;
    text += `- Track your shipments\n`;
    text += `- Save your preferences\n`;
    text += `- Get exclusive member benefits\n\n`;
    text += `Thank you for verifying your account. We look forward to serving you!\n\n`;
    text += `Best regards,\n`;
    text += `The NextWP E-commerce Team`;
    
    return text;
  }

  private generateLoyaltyUpgradeTemplate(customerData: CustomerEmailData): string {
    const newTier = customerData.data?.newTier || 'Gold';
    const benefits = customerData.data?.benefits || [];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Loyalty Upgrade</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>You've been upgraded to ${newTier} status!</p>
          </div>
          
          <div class="content">
            <h2>Hi ${customerData.customerName},</h2>
            <p>We're thrilled to announce that you've reached ${newTier} status in our loyalty program!</p>
            
            <div class="benefits">
              <h3>Your New Benefits:</h3>
              <ul>
                ${benefits.map((benefit: string) => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
            
            <p>Thank you for being a loyal customer. We appreciate your business and look forward to providing you with even better service!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 NextWP E-commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateLoyaltyUpgradeText(customerData: CustomerEmailData): string {
    const newTier = customerData.data?.newTier || 'Gold';
    const benefits = customerData.data?.benefits || [];
    
    let text = `Congratulations! You've been upgraded!\n\n`;
    text += `Hi ${customerData.customerName},\n\n`;
    text += `We're thrilled to announce that you've reached ${newTier} status in our loyalty program!\n\n`;
    text += `Your New Benefits:\n`;
    benefits.forEach((benefit: string) => {
      text += `- ${benefit}\n`;
    });
    text += `\n`;
    text += `Thank you for being a loyal customer. We appreciate your business and look forward to providing you with even better service!\n\n`;
    text += `Best regards,\n`;
    text += `The NextWP E-commerce Team`;
    
    return text;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
