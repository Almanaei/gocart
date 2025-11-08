const logger = require('../utils/logger');

/**
 * معالج الأخطاء العام
 */
exports.errorHandler = (err, req, res, next) => {
  logger.error('خطأ غير معالج:', err);

  // التحقق من نوع الخطأ وإرسال الاستجابة المناسبة
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'خطأ في التحقق من صحة البيانات',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'غير مصرح'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'غير مسموح'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'غير موجود'
    });
  }

  // في حالة الأخطاء غير المعروفة
  res.status(500).json({
    error: 'خطأ في الخادم'
  });
};

/**
 * معالج الطلبات غير الموجودة
 */
exports.notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'المسار غير موجود'
  });
}; 