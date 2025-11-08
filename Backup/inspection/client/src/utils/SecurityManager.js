import { useEffect, useState } from 'react';

// مدير الأمان للتطبيق
class SecurityManager {
  constructor() {
    this.csrfToken = null;
    this.tokenRefreshInterval = null;
  }

  // الحصول على رمز CSRF من الخادم
  async fetchCsrfToken() {
    try {
      const response = await fetch('/api/csrf-token');
      if (!response.ok) throw new Error('فشل في جلب رمز الحماية');
      const data = await response.json();
      this.csrfToken = data.csrfToken;
      return this.csrfToken;
    } catch (error) {
      console.error('خطأ في جلب رمز CSRF:', error);
      throw error;
    }
  }

  // إضافة رمز CSRF إلى رؤوس الطلب
  getRequestHeaders() {
    return {
      'CSRF-Token': this.csrfToken,
      'Content-Type': 'application/json'
    };
  }

  // تحقق من صحة البيانات المدخلة
  validateInput(input, rules = {}) {
    const errors = {};

    if (rules.required && !input) {
      errors.required = 'هذا الحقل مطلوب';
    }

    if (rules.minLength && input.length < rules.minLength) {
      errors.minLength = `يجب أن يكون الحقل ${rules.minLength} أحرف على الأقل`;
    }

    if (rules.pattern && !rules.pattern.test(input)) {
      errors.pattern = 'صيغة الإدخال غير صحيحة';
    }

    if (rules.custom) {
      const customError = rules.custom(input);
      if (customError) {
        errors.custom = customError;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // تشفير البيانات الحساسة
  encryptSensitiveData(data) {
    // TODO: تنفيذ تشفير البيانات الحساسة
    return data;
  }

  // فحص الملفات المرفوعة
  validateFile(file) {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      errors.push('حجم الملف يتجاوز الحد المسموح به (5MB)');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('نوع الملف غير مدعوم');
    }

    return errors.length > 0 ? errors : null;
  }
}

// نسخة واحدة من مدير الأمان
const securityManager = new SecurityManager();

// Hook لاستخدام مدير الأمان في المكونات
export function useSecurityManager() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // تهيئة مدير الأمان عند تحميل التطبيق
    const initializeSecurity = async () => {
      try {
        await securityManager.fetchCsrfToken();
        setIsReady(true);
      } catch (err) {
        setError(err);
      }
    };

    initializeSecurity();

    // تحديث رمز CSRF كل ساعة
    const tokenRefreshInterval = setInterval(async () => {
      try {
        await securityManager.fetchCsrfToken();
      } catch (err) {
        console.error('فشل في تحديث رمز CSRF:', err);
      }
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  return {
    isReady,
    error,
    securityManager,
    validateInput: securityManager.validateInput,
    validateFile: securityManager.validateFile,
    getRequestHeaders: () => securityManager.getRequestHeaders()
  };
}

export default securityManager; 