require('dotenv').config();
const path = require('path');

module.exports = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    cookieSecret: process.env.COOKIE_SECRET || 'your-secret-key'
  },
  
  database: {
    path: process.env.DB_PATH || path.join(__dirname, 'data', 'inspection.db')
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  
  upload: {
    path: process.env.UPLOAD_PATH || path.join(__dirname, 'uploads'),
    maxSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
  },
  
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100 // limit each IP to 100 requests per windowMs
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, 'logs', 'app.log')
  }
}; 