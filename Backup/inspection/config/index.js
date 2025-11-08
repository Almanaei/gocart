require('dotenv').config();

module.exports = {
    // تكوين التطبيق
    app: {
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3939,
    },

    // تكوين قاعدة البيانات
    database: {
        path: process.env.DB_PATH || './civilDefense.db',
    },

    // تكوين JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    // تكوين رفع الملفات
    upload: {
        path: process.env.UPLOAD_PATH || './uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    },

    // تكوين Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 دقيقة
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },

    // تكوين التسجيل
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log',
    },

    // تكوين CORS
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
}; 