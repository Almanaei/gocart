const BackupManager = require('../../utils/BackupManager');
const fs = require('fs').promises;
const path = require('path');

describe('BackupManager', () => {
  let backupManager;
  const testDbPath = './test.db';
  const backupDir = './backups';

  beforeEach(async () => {
    backupManager = new BackupManager();
    // إنشاء ملف قاعدة بيانات اختبارية
    await fs.writeFile(testDbPath, 'test data');
  });

  afterEach(async () => {
    // تنظيف الملفات بعد كل اختبار
    try {
      await fs.unlink(testDbPath);
      await fs.rm(backupDir, { recursive: true, force: true });
    } catch (error) {
      // تجاهل أخطاء عدم وجود الملفات
    }
  });

  describe('createBackup', () => {
    it('should create a backup file with timestamp', async () => {
      const result = await backupManager.createBackup(testDbPath);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('timestamp');

      const backupExists = await fs.access(result.filename)
        .then(() => true)
        .catch(() => false);
      expect(backupExists).toBe(true);
    });

    it('should encrypt backup data', async () => {
      const result = await backupManager.createBackup(testDbPath);
      const backupData = await fs.readFile(result.filename);
      
      // التحقق من أن البيانات مشفرة (لا تحتوي على النص الأصلي)
      expect(backupData.toString()).not.toContain('test data');
    });

    it('should save backup metadata', async () => {
      const result = await backupManager.createBackup(testDbPath);
      const metadata = await backupManager.getBackupMetadata(result.filename);

      expect(metadata).toHaveProperty('hash');
      expect(metadata).toHaveProperty('timestamp');
      expect(metadata).toHaveProperty('size');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore database from backup', async () => {
      // إنشاء نسخة احتياطية
      const backup = await backupManager.createBackup(testDbPath);
      
      // تغيير البيانات الأصلية
      await fs.writeFile(testDbPath, 'modified data');
      
      // استعادة النسخة الاحتياطية
      await backupManager.restoreFromBackup(backup.filename, testDbPath);
      
      // التحقق من استعادة البيانات الأصلية
      const restoredData = await fs.readFile(testDbPath, 'utf8');
      expect(restoredData).toBe('test data');
    });

    it('should validate backup before restoration', async () => {
      // إنشاء ملف نسخة احتياطية غير صالح
      const invalidBackupPath = path.join(backupDir, 'invalid.backup');
      await fs.mkdir(backupDir, { recursive: true });
      await fs.writeFile(invalidBackupPath, 'invalid data');

      await expect(backupManager.restoreFromBackup(invalidBackupPath, testDbPath))
        .rejects.toThrow('النسخة الاحتياطية غير صالحة');
    });

    it('should create backup of current state before restoration', async () => {
      // إنشاء نسخة احتياطية
      const backup = await backupManager.createBackup(testDbPath);
      
      // تغيير البيانات وإنشاء نسخة احتياطية جديدة
      await fs.writeFile(testDbPath, 'modified data');
      
      // استعادة النسخة الاحتياطية الأولى
      await backupManager.restoreFromBackup(backup.filename, testDbPath);
      
      // التحقق من وجود نسخة احتياطية للحالة قبل الاستعادة
      const backups = await backupManager.listBackups();
      const hasPreRestoreBackup = backups.some(b => b.filename.includes('pre_restore'));
      expect(hasPreRestoreBackup).toBe(true);
    });
  });

  describe('cleanOldBackups', () => {
    it('should remove backups exceeding retention limit', async () => {
      // إنشاء عدة نسخ احتياطية
      for (let i = 0; i < 5; i++) {
        await backupManager.createBackup(testDbPath);
        // تأخير لضمان اختلاف الطوابع الزمنية
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await backupManager.cleanOldBackups(3); // الاحتفاظ بآخر 3 نسخ فقط

      const remainingBackups = await backupManager.listBackups();
      expect(remainingBackups.length).toBe(3);
    });

    it('should keep recent backups', async () => {
      const backup = await backupManager.createBackup(testDbPath);
      await backupManager.cleanOldBackups(1);

      const backupExists = await fs.access(backup.filename)
        .then(() => true)
        .catch(() => false);
      expect(backupExists).toBe(true);
    });
  });

  describe('autoBackup', () => {
    it('should start and stop automatic backups', async () => {
      const backupInterval = 1000; // 1 second for testing
      
      // بدء النسخ الاحتياطي التلقائي
      backupManager.startAutoBackup(testDbPath, backupInterval);
      
      // انتظار لإنشاء نسخة احتياطية على الأقل
      await new Promise(resolve => setTimeout(resolve, backupInterval + 100));
      
      // إيقاف النسخ الاحتياطي التلقائي
      backupManager.stopAutoBackup();
      
      const backups = await backupManager.listBackups();
      expect(backups.length).toBeGreaterThan(0);
    });

    it('should handle errors during auto backup', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const backupInterval = 1000;
      
      // إتلاف ملف قاعدة البيانات لإثارة خطأ
      await fs.unlink(testDbPath);
      
      backupManager.startAutoBackup(testDbPath, backupInterval);
      await new Promise(resolve => setTimeout(resolve, backupInterval + 100));
      backupManager.stopAutoBackup();
      
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
}); 