const logger = require('./logger');

class ErrorManager {
  constructor() {
    // تعريف أنواع الأخطاء
    this.errorTypes = {
      VALIDATION_ERROR: 'ValidationError',
      AUTHENTICATION_ERROR: 'AuthenticationError',
      AUTHORIZATION_ERROR: 'AuthorizationError',
      DATABASE_ERROR: 'DatabaseError',
      FILE_ERROR: 'FileError',
      NOT_FOUND_ERROR: 'NotFoundError',
      CONFLICT_ERROR: 'ConflictError',
      RATE_LIMIT_ERROR: 'RateLimitError',
      INTERNAL_ERROR: 'InternalError'
    };
    
    // تعريف رسائل الأخطاء
    this.errorMessages = {
      [this.errorTypes.VALIDATION_ERROR]: 'خطأ في التحقق من صحة البيانات',
      [this.errorTypes.AUTHENTICATION_ERROR]: 'خطأ في المصادقة',
      [this.errorTypes.AUTHORIZATION_ERROR]: 'خطأ في الصلاحيات',
      [this.errorTypes.DATABASE_ERROR]: 'خطأ في قاعدة البيانات',
      [this.errorTypes.FILE_ERROR]: 'خطأ في معالجة الملف',
      [this.errorTypes.NOT_FOUND_ERROR]: 'المورد غير موجود',
      [this.errorTypes.CONFLICT_ERROR]: 'تعارض في البيانات',
      [this.errorTypes.RATE_LIMIT_ERROR]: 'تجاوز الحد الأقصى للطلبات',
      [this.errorTypes.INTERNAL_ERROR]: 'خطأ داخلي في الخادم'
    };
    
    // تعريف رموز الحالة HTTP
    this.httpStatusCodes = {
      [this.errorTypes.VALIDATION_ERROR]: 400,
      [this.errorTypes.AUTHENTICATION_ERROR]: 401,
      [this.errorTypes.AUTHORIZATION_ERROR]: 403,
      [this.errorTypes.DATABASE_ERROR]: 500,
      [this.errorTypes.FILE_ERROR]: 400,
      [this.errorTypes.NOT_FOUND_ERROR]: 404,
      [this.errorTypes.CONFLICT_ERROR]: 409,
      [this.errorTypes.RATE_LIMIT_ERROR]: 429,
      [this.errorTypes.INTERNAL_ERROR]: 500
    };
  }

  // إنشاء كائن خطأ
  createError(type, message, details = null) {
    const error = new Error(message || this.errorMessages[type]);
    error.type = type;
    error.statusCode = this.httpStatusCodes[type];
    
    if (details) {
      error.details = details;
    }
    
    return error;
  }

  // معالجة خطأ التحقق من صحة البيانات
  handleValidationError(validationResult) {
    return this.createError(
      this.errorTypes.VALIDATION_ERROR,
      'خطأ في التحقق من صحة البيانات',
      validationResult.errors
    );
  }

  // معالجة خطأ المصادقة
  handleAuthenticationError(message = null) {
    return this.createError(
      this.errorTypes.AUTHENTICATION_ERROR,
      message || 'فشل في المصادقة'
    );
  }

  // معالجة خطأ الصلاحيات
  handleAuthorizationError(message = null) {
    return this.createError(
      this.errorTypes.AUTHORIZATION_ERROR,
      message || 'ليس لديك الصلاحية للقيام بهذا الإجراء'
    );
  }

  // معالجة خطأ قاعدة البيانات
  handleDatabaseError(error) {
    logger.error('خطأ في قاعدة البيانات:', error);
    
    let message = this.errorMessages[this.errorTypes.DATABASE_ERROR];
    let details = null;
    
    // التعامل مع أخطاء SQLite المعروفة
    if (error.code === 'SQLITE_CONSTRAINT') {
      if (error.message.includes('UNIQUE')) {
        return this.createError(
          this.errorTypes.CONFLICT_ERROR,
          'القيمة موجودة مسبقاً'
        );
      }
      
      if (error.message.includes('FOREIGN KEY')) {
        return this.createError(
          this.errorTypes.VALIDATION_ERROR,
          'خطأ في العلاقة بين البيانات'
        );
      }
    }
    
    return this.createError(
      this.errorTypes.DATABASE_ERROR,
      message,
      details
    );
  }

  // معالجة خطأ الملفات
  handleFileError(error) {
    logger.error('خطأ في معالجة الملف:', error);
    
    let message = this.errorMessages[this.errorTypes.FILE_ERROR];
    let details = null;
    
    if (error.code === 'ENOENT') {
      message = 'الملف غير موجود';
    } else if (error.code === 'EACCES') {
      message = 'ليس لديك صلاحية الوصول للملف';
    } else if (error.code === 'EISDIR') {
      message = 'المسار المحدد هو مجلد وليس ملف';
    }
    
    return this.createError(
      this.errorTypes.FILE_ERROR,
      message,
      details
    );
  }

  // معالجة خطأ عدم وجود المورد
  handleNotFoundError(resource, id = null) {
    const message = id
      ? `${resource} رقم ${id} غير موجود`
      : `${resource} غير موجود`;
    
    return this.createError(
      this.errorTypes.NOT_FOUND_ERROR,
      message
    );
  }

  // معالجة خطأ تجاوز حد الطلبات
  handleRateLimitError(limit, windowMs) {
    const minutes = Math.ceil(windowMs / 60000);
    const message = `تجاوزت الحد الأقصى للطلبات (${limit} طلب كل ${minutes} دقيقة)`;
    
    return this.createError(
      this.errorTypes.RATE_LIMIT_ERROR,
      message
    );
  }

  // معالجة الخطأ الداخلي
  handleInternalError(error) {
    logger.error('خطأ داخلي:', error);
    
    return this.createError(
      this.errorTypes.INTERNAL_ERROR,
      this.errorMessages[this.errorTypes.INTERNAL_ERROR]
    );
  }

  // معالجة الخطأ في الطلب
  handleRequestError(error) {
    // إذا كان الخطأ معروف النوع، نعيده كما هو
    if (error.type && this.errorTypes[error.type]) {
      return error;
    }
    
    // معالجة الأخطاء حسب نوعها
    if (error.name === 'ValidationError') {
      return this.handleValidationError(error);
    }
    
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return this.handleAuthenticationError('رمز الوصول غير صالح');
    }
    
    if (error.code && error.code.startsWith('SQLITE_')) {
      return this.handleDatabaseError(error);
    }
    
    if (error.code && ['ENOENT', 'EACCES', 'EISDIR'].includes(error.code)) {
      return this.handleFileError(error);
    }
    
    // معالجة الأخطاء غير المعروفة كأخطاء داخلية
    return this.handleInternalError(error);
  }

  // تنسيق الخطأ للرد على الطلب
  formatErrorResponse(error) {
    const formattedError = {
      success: false,
      error: {
        message: error.message
      }
    };
    
    if (error.details) {
      formattedError.error.details = error.details;
    }
    
    // إضافة معلومات إضافية في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      formattedError.error.type = error.type;
      formattedError.error.stack = error.stack;
    }
    
    return formattedError;
  }
}

module.exports = ErrorManager; 