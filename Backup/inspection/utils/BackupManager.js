const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

class BackupManager {
  constructor(options = {}) {
    this.backupDir = options.backupDir || path.join(__dirname, '..', 'backups');
    this.maxBackups = options.maxBackups || 10;
    this.backupInterval = options.backupInterval || 24 * 60 * 60 * 1000; // 24 ساعة
    this.encryptionKey = options.encryptionKey || process.env.ENCRYPTION_KEY || 'your-encryption-key';
  }

  async init() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info('تم إنشاء مجلد النسخ الاحتياطي');
    } catch (error) {
      logger.error('خطأ في إنشاء مجلد النسخ الاحتياطي:', error);
    }
  }

  async createBackup(dbPath) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
      
      // نسخ قاعدة البيانات
      await fs.copyFile(dbPath, backupPath);
      
      // تشفير النسخة الاحتياطية
      await this.encryptFile(backupPath);
      
      // إنشاء ملف البيانات الوصفية
      const hash = await this.calculateHash(backupPath);
      const metadata = {
        timestamp,
        originalPath: dbPath,
        hash,
        encrypted: true
      };
      
      await fs.writeFile(
        backupPath + '.meta',
        JSON.stringify(metadata, null, 2)
      );
      
      logger.info(`تم إنشاء نسخة احتياطية: ${path.basename(backupPath)}`);
      
      // تنظيف النسخ القديمة
      await this.cleanOldBackups();
      
      return {
        path: backupPath,
        metadata
      };
    } catch (error) {
      logger.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      throw error;
    }
  }

  async restoreBackup(backupPath, dbPath) {
    try {
      // التحقق من وجود النسخة الاحتياطية
      if (!await this.verifyBackup(backupPath)) {
        throw new Error('النسخة الاحتياطية تالفة أو غير صالحة');
      }
      
      // فك تشفير النسخة الاحتياطية
      await this.decryptFile(backupPath);
      
      // استعادة قاعدة البيانات
      await fs.copyFile(backupPath, dbPath);
      
      logger.info(`تم استعادة النسخة الاحتياطية: ${path.basename(backupPath)}`);
    } catch (error) {
      logger.error('خطأ في استعادة النسخة الاحتياطية:', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];
      
      for (const file of files) {
        if (file.endsWith('.db')) {
          const metaPath = path.join(this.backupDir, file + '.meta');
          try {
            const metadata = JSON.parse(
              await fs.readFile(metaPath, 'utf8')
            );
            backups.push({
              file,
              ...metadata
            });
          } catch (error) {
            logger.warn(`خطأ في قراءة البيانات الوصفية للنسخة ${file}:`, error);
          }
        }
      }
      
      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      logger.error('خطأ في قراءة النسخ الاحتياطية:', error);
      throw error;
    }
  }

  async cleanOldBackups() {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        
        for (const backup of toDelete) {
          const backupPath = path.join(this.backupDir, backup.file);
          const metaPath = backupPath + '.meta';
          
          await fs.unlink(backupPath);
          await fs.unlink(metaPath);
          
          logger.info(`تم حذف النسخة القديمة: ${backup.file}`);
        }
      }
    } catch (error) {
      logger.error('خطأ في تنظيف النسخ القديمة:', error);
    }
  }

  async verifyBackup(backupPath) {
    try {
      const metaPath = backupPath + '.meta';
      const metadata = JSON.parse(
        await fs.readFile(metaPath, 'utf8')
      );
      
      const currentHash = await this.calculateHash(backupPath);
      return currentHash === metadata.hash;
    } catch (error) {
      logger.error('خطأ في التحقق من النسخة الاحتياطية:', error);
      return false;
    }
  }

  async calculateHash(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (error) {
      logger.error('خطأ في حساب البصمة الرقمية:', error);
      throw error;
    }
  }

  async encryptFile(filePath) {
    try {
      const data = await fs.readFile(filePath);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey), iv);
      
      const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
      ]);
      
      const authTag = cipher.getAuthTag();
      
      await fs.writeFile(filePath, Buffer.concat([iv, authTag, encrypted]));
    } catch (error) {
      logger.error('خطأ في تشفير الملف:', error);
      throw error;
    }
  }

  async decryptFile(filePath) {
    try {
      const data = await fs.readFile(filePath);
      
      const iv = data.slice(0, 16);
      const authTag = data.slice(16, 32);
      const encrypted = data.slice(32);
      
      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey), iv);
      decipher.setAuthTag(authTag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      await fs.writeFile(filePath, decrypted);
    } catch (error) {
      logger.error('خطأ في فك تشفير الملف:', error);
      throw error;
    }
  }

  startAutoBackup(dbPath) {
    this.init().then(() => {
      // إنشاء نسخة احتياطية عند بدء التشغيل
      this.createBackup(dbPath).catch(error => {
        logger.error('فشل في إنشاء النسخة الاحتياطية الأولية:', error);
      });
      
      // جدولة النسخ الاحتياطي التلقائي
      setInterval(() => {
        this.createBackup(dbPath).catch(error => {
          logger.error('فشل في إنشاء النسخة الاحتياطية الدورية:', error);
        });
      }, this.backupInterval);
      
      logger.info('تم تفعيل النسخ الاحتياطي التلقائي');
    });
  }
}

module.exports = BackupManager; 