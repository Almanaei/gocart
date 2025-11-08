const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * محدد معدل الطلبات العام
 */
exports.globalLimiter = rateLimit({
  windowMs: config.rateLimit.window, // فترة النافذة الزمنية
  max: config.rateLimit.max, // الحد الأقصى للطلبات
  message: {
    error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً'
  },
  handler: (req, res, next, options) => {
    logger.warn('تم تجاوز حد معدل الطلبات:', {
      ip: req.ip,
      path: req.path,
      limit: options.max,
      windowMs: options.windowMs
    });
    res.status(429).json(options.message);
  }
});

/**
 * محدد معدل طلبات تسجيل الدخول
 */
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات
  message: {
    error: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة'
  },
  handler: (req, res, next, options) => {
    logger.warn('تم تجاوز حد محاولات تسجيل الدخول:', {
      ip: req.ip,
      username: req.body.username
    });
    res.status(429).json(options.message);
  }
});

/**
 * محدد معدل طلبات تغيير كلمة المرور
 */
exports.passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 محاولات
  message: {
    error: 'تم تجاوز الحد الأقصى لمحاولات تغيير كلمة المرور. يرجى المحاولة بعد ساعة'
  }
}); 