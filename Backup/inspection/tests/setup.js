const path = require('path');
const fs = require('fs').promises;

// إعداد المسارات للاختبارات
process.env.NODE_ENV = 'test';
process.env.TEST_DB_PATH = path.join(__dirname, 'test.db');
process.env.BACKUP_DIR = path.join(__dirname, 'backups');
process.env.UPLOAD_DIR = path.join(__dirname, 'uploads');

// إنشاء المجلدات اللازمة للاختبارات
beforeAll(async () => {
  const dirs = [
    process.env.BACKUP_DIR,
    process.env.UPLOAD_DIR
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true })
      .catch(() => {}); // تجاهل الخطأ إذا كان المجلد موجوداً
  }
});

// تنظيف الملفات بعد الانتهاء من جميع الاختبارات
afterAll(async () => {
  const paths = [
    process.env.TEST_DB_PATH,
    process.env.BACKUP_DIR,
    process.env.UPLOAD_DIR
  ];

  for (const p of paths) {
    await fs.rm(p, { recursive: true, force: true })
      .catch(() => {}); // تجاهل الخطأ إذا كان المجلد غير موجود
  }
});

// إعداد المتغيرات العامة للاختبارات
global.testConfig = {
  app: {
    port: 3000,
    env: 'test',
    cookieSecret: 'test-secret'
  },
  database: {
    path: process.env.TEST_DB_PATH
  },
  upload: {
    path: process.env.UPLOAD_DIR,
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  },
  backup: {
    path: process.env.BACKUP_DIR,
    interval: 24 * 60 * 60 * 1000, // 24 hours
    retention: 7 // keep last 7 backups
  }
}; 