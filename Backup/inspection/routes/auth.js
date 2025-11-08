const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config');
const logger = require('../utils/logger');
const dbManager = require('../utils/DatabaseManager');
const { validate } = require('../middlewares/validation');
const { loginLimiter } = require('../middlewares/rateLimiter');

// Validation middleware
const validateLogin = [
  body('username').trim().notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').trim().notEmpty().withMessage('كلمة المرور مطلوبة')
];

const validateRegistration = [
  body('username').notEmpty().withMessage('اسم المستخدم مطلوب')
    .isLength({ min: 3 }).withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('role').notEmpty().withMessage('الدور مطلوب')
    .isIn(['admin', 'inspector', 'officer']).withMessage('دور غير صالح')
];

// التحقق من صحة بيانات تسجيل الدخول
const loginValidation = [
  body('username').trim().notEmpty().withMessage('اسم المستخدم مطلوب'),
  body('password').trim().notEmpty().withMessage('كلمة المرور مطلوبة')
];

// Login route
router.post('/login', loginLimiter, loginValidation, validate, async (req, res) => {
  const { username, password } = req.body;

  try {
    // البحث عن المستخدم
    const user = await dbManager.queryOne('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({
        error: 'بيانات الدخول غير صحيحة'
      });
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'بيانات الدخول غير صحيحة'
      });
    }

    // تحديث آخر تسجيل دخول
    await dbManager.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // إنشاء رمز JWT
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
        tokenVersion: user.token_version
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
});

// Register route (admin only)
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    // Check if username exists
    const existingUser = await dbManager.queryOne('SELECT id FROM users WHERE username = ?', [username]);

    if (existingUser) {
      return res.status(400).json({
        error: 'اسم المستخدم موجود بالفعل'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await dbManager.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role]
    );

    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      userId: result.lastID
    });
  } catch (error) {
    logger.error('خطأ في إنشاء المستخدم:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'غير مصرح' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await dbManager.queryOne(
      'SELECT id, username, role, last_login FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json(user);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'رمز غير صالح' });
    }
    logger.error('خطأ في جلب بيانات المستخدم:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Logout (optional, client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// تغيير كلمة المرور
router.post('/change-password', loginValidation, validate, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    // البحث عن المستخدم
    const user = await dbManager.queryOne('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({
        error: 'المستخدم غير موجود'
      });
    }

    // التحقق من كلمة المرور الحالية
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // تحديث كلمة المرور وزيادة نسخة الرمز
    await dbManager.execute(
      'UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({
      message: 'تم تحديث كلمة المرور بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء تغيير كلمة المرور'
    });
  }
});

module.exports = router; 