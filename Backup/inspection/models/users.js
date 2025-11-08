const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const config = require('../config');
const logger = require('../utils/logger');

const db = new sqlite3.Database(config.database.path);

// إنشاء جدول المستخدمين
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'inspector', 'officer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
)`);

const Users = {
    // إنشاء مستخدم جديد
    async create(userData) {
        const { username, password, full_name, role } = userData;
        
        try {
            // تشفير كلمة المرور
            const hashedPassword = await bcrypt.hash(password, 10);
            
            return new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)`,
                    [username, hashedPassword, full_name, role],
                    function(err) {
                        if (err) {
                            logger.error('خطأ في إنشاء المستخدم:', err);
                            reject(err);
                        } else {
                            resolve({
                                id: this.lastID,
                                username,
                                full_name,
                                role
                            });
                        }
                    }
                );
            });
        } catch (err) {
            logger.error('خطأ في تشفير كلمة المرور:', err);
            throw err;
        }
    },

    // التحقق من صحة بيانات تسجيل الدخول
    async authenticate(username, password) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE username = ? AND is_active = 1`,
                [username],
                async (err, user) => {
                    if (err) {
                        logger.error('خطأ في التحقق من المستخدم:', err);
                        reject(err);
                    } else if (!user) {
                        resolve(null);
                    } else {
                        try {
                            const isValid = await bcrypt.compare(password, user.password);
                            if (isValid) {
                                // تحديث آخر تسجيل دخول
                                db.run(
                                    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
                                    [user.id]
                                );
                                
                                // إرجاع بيانات المستخدم بدون كلمة المرور
                                const { password, ...userWithoutPassword } = user;
                                resolve(userWithoutPassword);
                            } else {
                                resolve(null);
                            }
                        } catch (err) {
                            logger.error('خطأ في مقارنة كلمة المرور:', err);
                            reject(err);
                        }
                    }
                }
            );
        });
    },

    // الحصول على مستخدم بواسطة المعرف
    async getById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id, username, full_name, role, created_at, last_login, is_active 
                 FROM users WHERE id = ?`,
                [id],
                (err, user) => {
                    if (err) {
                        logger.error('خطأ في جلب بيانات المستخدم:', err);
                        reject(err);
                    } else {
                        resolve(user);
                    }
                }
            );
        });
    },

    // تحديث بيانات المستخدم
    async update(id, userData) {
        const { full_name, role, is_active } = userData;
        
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users 
                 SET full_name = ?, role = ?, is_active = ?
                 WHERE id = ?`,
                [full_name, role, is_active ? 1 : 0, id],
                function(err) {
                    if (err) {
                        logger.error('خطأ في تحديث بيانات المستخدم:', err);
                        reject(err);
                    } else {
                        resolve({ id, full_name, role, is_active });
                    }
                }
            );
        });
    },

    // تغيير كلمة المرور
    async changePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            return new Promise((resolve, reject) => {
                db.run(
                    `UPDATE users SET password = ? WHERE id = ?`,
                    [hashedPassword, id],
                    function(err) {
                        if (err) {
                            logger.error('خطأ في تغيير كلمة المرور:', err);
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    }
                );
            });
        } catch (err) {
            logger.error('خطأ في تشفير كلمة المرور الجديدة:', err);
            throw err;
        }
    }
};

module.exports = Users; 