const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { db } = require('../utils/DatabaseManager');

/**
 * تسجيل الدخول
 * @param {Object} req - طلب Express
 * @param {Object} res - استجابة Express
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'يجب توفير اسم المستخدم وكلمة المرور'
    });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // تحديث آخر تسجيل دخول
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // إنشاء رمز JWT
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
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
};

/**
 * تسجيل مستخدم جديد
 * @param {Object} req - طلب Express
 * @param {Object} res - استجابة Express
 */
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      error: 'جميع الحقول مطلوبة'
    });
  }

  try {
    // التحقق من وجود المستخدم
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'اسم المستخدم موجود بالفعل'
      });
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إنشاء المستخدم
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      userId: result
    });

  } catch (error) {
    logger.error('خطأ في إنشاء المستخدم:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء إنشاء المستخدم'
    });
  }
};

/**
 * تغيير كلمة المرور
 * @param {Object} req - طلب Express
 * @param {Object} res - استجابة Express
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'يجب توفير كلمة المرور الحالية والجديدة'
    });
  }

  try {
    // جلب بيانات المستخدم
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

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
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?',
        [hashedPassword, userId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.json({
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء تغيير كلمة المرور'
    });
  }
}; 