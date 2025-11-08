const logger = require('./logger');

class ValidationManager {
  constructor() {
    // قواعد التحقق من صحة البيانات
    this.rules = {
      // قواعد المستخدمين
      user: {
        username: {
          required: true,
          minLength: 3,
          maxLength: 50,
          pattern: /^[a-zA-Z0-9_]+$/
        },
        password: {
          required: true,
          minLength: 8,
          maxLength: 100,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        },
        role: {
          required: true,
          enum: ['admin', 'inspector', 'viewer']
        }
      },
      
      // قواعد المنشآت
      facility: {
        name: {
          required: true,
          minLength: 3,
          maxLength: 100
        },
        type: {
          required: true,
          enum: ['commercial', 'industrial', 'residential', 'government']
        },
        address: {
          required: true,
          maxLength: 200
        },
        coordinates: {
          pattern: /^-?\d+\.\d+,\s*-?\d+\.\d+$/
        },
        owner_name: {
          required: true,
          maxLength: 100
        },
        owner_contact: {
          pattern: /^[+]?[\d\s-]+$/
        },
        license_number: {
          required: true,
          pattern: /^[A-Z0-9-]+$/
        }
      },
      
      // قواعد عمليات التفتيش
      inspection: {
        facility_id: {
          required: true,
          type: 'integer'
        },
        inspector_id: {
          required: true,
          type: 'integer'
        },
        inspection_date: {
          required: true,
          type: 'date'
        },
        status: {
          required: true,
          enum: ['scheduled', 'in_progress', 'completed', 'cancelled']
        },
        notes: {
          maxLength: 1000
        }
      },
      
      // قواعد المخالفات
      violation: {
        inspection_id: {
          required: true,
          type: 'integer'
        },
        type: {
          required: true,
          enum: ['safety', 'security', 'environmental', 'operational', 'documentation']
        },
        description: {
          required: true,
          maxLength: 500
        },
        severity: {
          required: true,
          enum: ['low', 'medium', 'high', 'critical']
        },
        status: {
          required: true,
          enum: ['open', 'in_progress', 'resolved', 'closed']
        },
        due_date: {
          type: 'date'
        }
      },
      
      // قواعد المرفقات
      attachment: {
        reference_type: {
          required: true,
          enum: ['inspection', 'violation']
        },
        reference_id: {
          required: true,
          type: 'integer'
        },
        file_path: {
          required: true,
          maxLength: 255
        },
        file_type: {
          required: true,
          enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        },
        file_size: {
          required: true,
          type: 'integer',
          min: 0,
          max: 5242880 // 5MB
        },
        file_hash: {
          required: true,
          pattern: /^[a-f0-9]{64}$/
        }
      }
    };
  }

  validate(data, type) {
    try {
      const errors = {};
      const rules = this.rules[type];
      
      if (!rules) {
        throw new Error(`نوع غير صالح للتحقق: ${type}`);
      }
      
      // التحقق من كل حقل
      for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field];
        const fieldErrors = [];
        
        // التحقق من الحقول المطلوبة
        if (fieldRules.required && (value === undefined || value === null || value === '')) {
          fieldErrors.push('هذا الحقل مطلوب');
        }
        
        if (value !== undefined && value !== null) {
          // التحقق من نوع البيانات
          if (fieldRules.type) {
            if (!this.validateType(value, fieldRules.type)) {
              fieldErrors.push(`يجب أن يكون نوع البيانات ${fieldRules.type}`);
            }
          }
          
          // التحقق من القيم المحددة
          if (fieldRules.enum && !fieldRules.enum.includes(value)) {
            fieldErrors.push(`القيمة يجب أن تكون واحدة من: ${fieldRules.enum.join(', ')}`);
          }
          
          // التحقق من الحد الأدنى للطول
          if (fieldRules.minLength && String(value).length < fieldRules.minLength) {
            fieldErrors.push(`يجب أن لا يقل الطول عن ${fieldRules.minLength} حروف`);
          }
          
          // التحقق من الحد الأقصى للطول
          if (fieldRules.maxLength && String(value).length > fieldRules.maxLength) {
            fieldErrors.push(`يجب أن لا يزيد الطول عن ${fieldRules.maxLength} حروف`);
          }
          
          // التحقق من النمط
          if (fieldRules.pattern && !fieldRules.pattern.test(String(value))) {
            fieldErrors.push('القيمة غير صالحة');
          }
          
          // التحقق من القيمة الدنيا
          if (fieldRules.min !== undefined && Number(value) < fieldRules.min) {
            fieldErrors.push(`يجب أن تكون القيمة أكبر من أو تساوي ${fieldRules.min}`);
          }
          
          // التحقق من القيمة القصوى
          if (fieldRules.max !== undefined && Number(value) > fieldRules.max) {
            fieldErrors.push(`يجب أن تكون القيمة أقل من أو تساوي ${fieldRules.max}`);
          }
        }
        
        if (fieldErrors.length > 0) {
          errors[field] = fieldErrors;
        }
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    } catch (error) {
      logger.error('خطأ في التحقق من صحة البيانات:', error);
      throw error;
    }
  }

  validateType(value, type) {
    switch (type) {
      case 'integer':
        return Number.isInteger(Number(value));
      
      case 'date':
        return !isNaN(Date.parse(value));
      
      default:
        return true;
    }
  }

  // التحقق من صحة بيانات المستخدم
  validateUser(data) {
    return this.validate(data, 'user');
  }

  // التحقق من صحة بيانات المنشأة
  validateFacility(data) {
    return this.validate(data, 'facility');
  }

  // التحقق من صحة بيانات عملية التفتيش
  validateInspection(data) {
    return this.validate(data, 'inspection');
  }

  // التحقق من صحة بيانات المخالفة
  validateViolation(data) {
    return this.validate(data, 'violation');
  }

  // التحقق من صحة بيانات المرفق
  validateAttachment(data) {
    return this.validate(data, 'attachment');
  }
}

module.exports = ValidationManager; 