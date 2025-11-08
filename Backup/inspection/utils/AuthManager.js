const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

class AuthManager {
  constructor(options = {}) {
    this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET || 'your-jwt-secret-key';
    this.jwtExpiresIn = options.jwtExpiresIn || process.env.JWT_EXPIRES_IN || '1d';
    this.saltRounds = options.saltRounds || 10;
    
    // تعريف الصلاحيات لكل دور
    this.permissions = {
      admin: [
        'manage_users',
        'manage_facilities',
        'manage_inspections',
        'manage_violations',
        'manage_attachments',
        'view_statistics',
        'export_data'
      ],
      inspector: [
        'view_facilities',
        'create_inspection',
        'update_inspection',
        'create_violation',
        'update_violation',
        'manage_attachments'
      ],
      viewer: [
        'view_facilities',
        'view_inspections',
        'view_violations',
        'view_attachments'
      ]
    };
  }

  // تشفير كلمة المرور
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      logger.error('خطأ في تشفير كلمة المرور:', error);
      throw error;
    }
  }

  // التحقق من كلمة المرور
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('خطأ في التحقق من كلمة المرور:', error);
      throw error;
    }
  }

  // إنشاء رمز الوصول
  generateToken(user) {
    try {
      const payload = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      
      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });
    } catch (error) {
      logger.error('خطأ في إنشاء رمز الوصول:', error);
      throw error;
    }
  }

  // التحقق من رمز الوصول
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn('رمز الوصول منتهي الصلاحية');
      } else {
        logger.error('خطأ في التحقق من رمز الوصول:', error);
      }
      throw error;
    }
  }

  // التحقق من الصلاحيات
  hasPermission(role, permission) {
    try {
      if (!this.permissions[role]) {
        logger.warn(`دور غير معروف: ${role}`);
        return false;
      }
      
      return this.permissions[role].includes(permission);
    } catch (error) {
      logger.error('خطأ في التحقق من الصلاحيات:', error);
      throw error;
    }
  }

  // التحقق من صلاحيات متعددة
  hasPermissions(role, permissions) {
    try {
      return permissions.every(permission => this.hasPermission(role, permission));
    } catch (error) {
      logger.error('خطأ في التحقق من الصلاحيات المتعددة:', error);
      throw error;
    }
  }

  // التحقق من صلاحية واحدة على الأقل
  hasAnyPermission(role, permissions) {
    try {
      return permissions.some(permission => this.hasPermission(role, permission));
    } catch (error) {
      logger.error('خطأ في التحقق من الصلاحيات:', error);
      throw error;
    }
  }

  // استخراج رمز الوصول من رأس الطلب
  extractTokenFromHeader(header) {
    try {
      if (!header || !header.startsWith('Bearer ')) {
        return null;
      }
      
      return header.split(' ')[1];
    } catch (error) {
      logger.error('خطأ في استخراج رمز الوصول:', error);
      throw error;
    }
  }

  // التحقق من المصادقة والتفويض
  async authenticate(header) {
    try {
      const token = this.extractTokenFromHeader(header);
      
      if (!token) {
        throw new Error('رمز الوصول غير موجود');
      }
      
      const decoded = this.verifyToken(token);
      
      return {
        isAuthenticated: true,
        user: decoded
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error.message
      };
    }
  }

  // التحقق من الصلاحية للوصول إلى مورد
  async authorizeAccess(user, resource, action) {
    try {
      if (!user || !user.role) {
        return {
          isAuthorized: false,
          error: 'مستخدم غير مصرح'
        };
      }
      
      const permission = `${action}_${resource}`;
      const hasAccess = this.hasPermission(user.role, permission);
      
      return {
        isAuthorized: hasAccess,
        error: hasAccess ? null : 'صلاحيات غير كافية'
      };
    } catch (error) {
      logger.error('خطأ في التحقق من الصلاحيات:', error);
      return {
        isAuthorized: false,
        error: error.message
      };
    }
  }

  // التحقق من ملكية المورد
  async authorizeOwnership(user, resource, resourceId, db) {
    try {
      if (!user || !user.id) {
        return {
          isAuthorized: false,
          error: 'مستخدم غير مصرح'
        };
      }
      
      // التحقق من الملكية حسب نوع المورد
      let isOwner = false;
      
      switch (resource) {
        case 'inspection':
          const inspection = await db.get(
            'SELECT inspector_id FROM inspections WHERE id = ?',
            [resourceId]
          );
          isOwner = inspection && inspection.inspector_id === user.id;
          break;
        
        case 'violation':
          const violation = await db.get(
            `SELECT i.inspector_id
             FROM violations v
             JOIN inspections i ON v.inspection_id = i.id
             WHERE v.id = ?`,
            [resourceId]
          );
          isOwner = violation && violation.inspector_id === user.id;
          break;
        
        case 'attachment':
          const attachment = await db.get(
            `SELECT i.inspector_id
             FROM attachments a
             JOIN inspections i ON (
               a.reference_type = 'inspection' AND a.reference_id = i.id
             ) OR (
               a.reference_type = 'violation' AND
               a.reference_id IN (
                 SELECT id FROM violations WHERE inspection_id = i.id
               )
             )
             WHERE a.id = ?`,
            [resourceId]
          );
          isOwner = attachment && attachment.inspector_id === user.id;
          break;
        
        default:
          return {
            isAuthorized: false,
            error: 'نوع مورد غير معروف'
          };
      }
      
      return {
        isAuthorized: isOwner,
        error: isOwner ? null : 'ليس لديك صلاحية الوصول لهذا المورد'
      };
    } catch (error) {
      logger.error('خطأ في التحقق من ملكية المورد:', error);
      return {
        isAuthorized: false,
        error: error.message
      };
    }
  }
}

module.exports = AuthManager; 