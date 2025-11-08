const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * وسيط للتحقق من نتائج التحقق من صحة البيانات
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('خطأ في التحقق من صحة البيانات:', {
      errors: errors.array(),
      path: req.path,
      body: req.body
    });

    return res.status(400).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * وسيط للتحقق من وجود الملفات المرفقة
 */
exports.validateFileUpload = (fieldName) => {
  return (req, res, next) => {
    if (!req.files || !req.files[fieldName]) {
      return res.status(400).json({
        error: 'لم يتم توفير الملف المطلوب'
      });
    }
    next();
  };
};

/**
 * التحقق من صحة معرف
 */
exports.validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: 'معرف غير صالح'
    });
  }
  req.params.id = id;
  next();
};

/**
 * التحقق من صحة التاريخ
 */
exports.validateDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * التحقق من صحة البريد الإلكتروني
 */
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * التحقق من صحة رقم الهاتف
 */
exports.validatePhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{8,}$/;
  return phoneRegex.test(phone);
}; 