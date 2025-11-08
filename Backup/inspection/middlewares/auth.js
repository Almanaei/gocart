const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const dbManager = require('../utils/DatabaseManager');

/**
 * التحقق من وجود رمز JWT صالح
 */
exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'لم يتم توفير رمز المصادقة'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // التحقق من وجود المستخدم وصلاحية نسخة الرمز
    const user = await dbManager.queryOne(
      'SELECT id, username, role, token_version FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        error: 'المستخدم غير موجود'
      });
    }

    // التحقق من نسخة الرمز
    if (user.token_version !== decoded.tokenVersion) {
      return res.status(401).json({
        error: 'رمز المصادقة منتهي الصلاحية'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('خطأ في التحقق من رمز المصادقة:', error);
    res.status(401).json({
      error: 'رمز المصادقة غير صالح'
    });
  }
};

/**
 * التحقق من صلاحيات المستخدم
 * @param {string[]} roles - الأدوار المسموح بها
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'غير مصرح'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'غير مسموح'
      });
    }

    next();
  };
}; 