const winston = require('winston');
const path = require('path');
const config = require('../config');

// تكوين تنسيق السجلات
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// إنشاء مجلد السجلات إذا لم يكن موجوداً
const logDir = path.dirname(config.logging.file);
if (!require('fs').existsSync(logDir)) {
    require('fs').mkdirSync(logDir, { recursive: true });
}

// إنشاء مسجل السجلات
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: [
        // تسجيل الأخطاء في ملف منفصل
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        // تسجيل جميع المستويات في ملف مجمع
        new winston.transports.File({
            filename: config.logging.file
        })
    ]
});

// إضافة تسجيل في وحدة التحكم في بيئة التطوير
if (config.app.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger; 