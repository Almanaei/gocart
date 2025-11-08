const sqlite3 = require('sqlite3').verbose();
const config = require('../config');
const logger = require('./logger');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isConnecting = false;
    this.connectionQueue = [];
    this.queryTimeoutMs = 30000; // 30 seconds timeout for queries
    this.connect();
  }

  connect() {
    // If already connected, return the existing connection
    if (this.db) {
      return this.db;
    }

    // If connection is in progress, queue up the request
    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        this.connectionQueue.push({ resolve, reject });
      });
    }

    this.isConnecting = true;

    // Create a new connection
    this.db = new sqlite3.Database(config.database.path, (err) => {
      if (err) {
        this.isConnecting = false;
        logger.error('خطأ في الاتصال بقاعدة البيانات:', err.message);
        
        // Reject all queued requests
        this.connectionQueue.forEach(request => request.reject(err));
        this.connectionQueue = [];
        
        throw err;
      }
      
      logger.info('تم الاتصال بقاعدة البيانات بنجاح');
      
      // Process queued connection requests
      this.connectionQueue.forEach(request => request.resolve(this.db));
      this.connectionQueue = [];
      this.isConnecting = false;
      
      // Configure the database
      this.configureDatabase();
    });

    return this.db;
  }

  configureDatabase() {
    this.db.serialize(() => {
      // تمكين القيود الخارجية
      this.db.run('PRAGMA foreign_keys = ON');
      
      // تحسين الأداء
      this.db.run('PRAGMA journal_mode = WAL');
      this.db.run('PRAGMA synchronous = NORMAL');
      this.db.run('PRAGMA temp_store = MEMORY');
      this.db.run('PRAGMA mmap_size = 30000000000');
      this.db.run('PRAGMA page_size = 4096');
      this.db.run('PRAGMA cache_size = -2000');
    });
  }

  disconnect() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          logger.error('خطأ في إغلاق قاعدة البيانات:', err.message);
        } else {
          logger.info('تم إغلاق الاتصال بقاعدة البيانات');
          this.db = null;
        }
      });
    }
  }

  // تنفيذ استعلام مع وعد ومهلة زمنية
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          logger.error(`استعلام تجاوز المدة المحددة: ${sql}`);
          reject(new Error('استعلام قاعدة البيانات تجاوز المدة المحددة'));
        }
      }, this.queryTimeoutMs);

      try {
        this.db.all(sql, params, (err, rows) => {
          clearTimeout(timeout);
          if (isResolved) return;
          isResolved = true;
          
          if (err) {
            logger.error('خطأ في تنفيذ الاستعلام:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        if (isResolved) return;
        isResolved = true;
        
        logger.error('خطأ في تنفيذ الاستعلام:', err);
        reject(err);
      }
    });
  }

  // تنفيذ استعلام واحد مع وعد ومهلة زمنية
  queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          logger.error(`استعلام تجاوز المدة المحددة: ${sql}`);
          reject(new Error('استعلام قاعدة البيانات تجاوز المدة المحددة'));
        }
      }, this.queryTimeoutMs);

      try {
        this.db.get(sql, params, (err, row) => {
          clearTimeout(timeout);
          if (isResolved) return;
          isResolved = true;
          
          if (err) {
            logger.error('خطأ في تنفيذ الاستعلام:', err);
            reject(err);
          } else {
            resolve(row);
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        if (isResolved) return;
        isResolved = true;
        
        logger.error('خطأ في تنفيذ الاستعلام:', err);
        reject(err);
      }
    });
  }

  // تنفيذ استعلام تعديل مع وعد ومهلة زمنية
  execute(sql, params = []) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          logger.error(`استعلام تجاوز المدة المحددة: ${sql}`);
          reject(new Error('استعلام قاعدة البيانات تجاوز المدة المحددة'));
        }
      }, this.queryTimeoutMs);

      try {
        this.db.run(sql, params, function(err) {
          clearTimeout(timeout);
          if (isResolved) return;
          isResolved = true;
          
          if (err) {
            logger.error('خطأ في تنفيذ الاستعلام:', err);
            reject(err);
          } else {
            resolve({
              lastID: this.lastID,
              changes: this.changes
            });
          }
        });
      } catch (err) {
        clearTimeout(timeout);
        if (isResolved) return;
        isResolved = true;
        
        logger.error('خطأ في تنفيذ الاستعلام:', err);
        reject(err);
      }
    });
  }

  // تنفيذ مجموعة من الاستعلامات في معاملة واحدة مع مهلة زمنية
  async transaction(callback) {
    let isResolved = false;
    const transactionTimeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        logger.error('المعاملة تجاوزت المدة المحددة');
        this.db.run('ROLLBACK');
        throw new Error('معاملة قاعدة البيانات تجاوزت المدة المحددة');
      }
    }, this.queryTimeoutMs * 2); // معاملات تستغرق وقتًا أطول

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        try {
          callback(this.db)
            .then(() => {
              this.db.run('COMMIT', (err) => {
                clearTimeout(transactionTimeout);
                if (isResolved) return;
                isResolved = true;
                
                if (err) {
                  logger.error('خطأ في تنفيذ المعاملة:', err);
                  this.db.run('ROLLBACK');
                  reject(err);
                } else {
                  resolve();
                }
              });
            })
            .catch((err) => {
              clearTimeout(transactionTimeout);
              if (isResolved) return;
              isResolved = true;
              
              logger.error('خطأ في تنفيذ المعاملة:', err);
              this.db.run('ROLLBACK');
              reject(err);
            });
        } catch (err) {
          clearTimeout(transactionTimeout);
          if (isResolved) return;
          isResolved = true;
          
          logger.error('خطأ في تنفيذ المعاملة:', err);
          this.db.run('ROLLBACK');
          reject(err);
        }
      });
    });
  }
}

// إنشاء نسخة واحدة من مدير قاعدة البيانات
const dbManager = new DatabaseManager();

// تصدير النسخة الوحيدة
module.exports = dbManager; 