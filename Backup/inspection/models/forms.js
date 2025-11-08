const { db } = require('../utils/DatabaseManager');
const logger = require('../utils/logger');

class Form {
  /**
   * إنشاء نموذج جديد
   * @param {Object} data - بيانات النموذج
   * @returns {Promise<number>} معرف النموذج الجديد
   */
  static async create(data) {
    return new Promise((resolve, reject) => {
      const {
        file_no,
        reference_no,
        occupancy_name,
        facility_nature,
        service_type,
        preview_date,
        status = 'draft'
      } = data;

      db.run(
        `INSERT INTO forms (
          file_no, reference_no, occupancy_name, facility_nature,
          service_type, preview_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          file_no,
          reference_no,
          occupancy_name,
          facility_nature,
          service_type,
          preview_date,
          status
        ],
        function(err) {
          if (err) {
            logger.error('خطأ في إنشاء النموذج:', err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * تحديث نموذج موجود
   * @param {number} id - معرف النموذج
   * @param {Object} data - البيانات المحدثة
   * @returns {Promise<void>}
   */
  static async update(id, data) {
    return new Promise((resolve, reject) => {
      const {
        file_no,
        reference_no,
        occupancy_name,
        facility_nature,
        service_type,
        preview_date,
        status
      } = data;

      db.run(
        `UPDATE forms SET
          file_no = COALESCE(?, file_no),
          reference_no = COALESCE(?, reference_no),
          occupancy_name = COALESCE(?, occupancy_name),
          facility_nature = COALESCE(?, facility_nature),
          service_type = COALESCE(?, service_type),
          preview_date = COALESCE(?, preview_date),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          file_no,
          reference_no,
          occupancy_name,
          facility_nature,
          service_type,
          preview_date,
          status,
          id
        ],
        (err) => {
          if (err) {
            logger.error('خطأ في تحديث النموذج:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * حذف نموذج
   * @param {number} id - معرف النموذج
   * @returns {Promise<void>}
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const tables = [
          'photos',
          'officers',
          'inspectors',
          'inspection_results',
          'observations',
          'requirements',
          'addresses',
          'custom_requirements',
          'custom_criteria',
          'custom_recommendations',
          'forms'
        ];

        let completed = 0;
        const total = tables.length;

        tables.forEach(table => {
          db.run(
            `DELETE FROM ${table} WHERE ${table === 'forms' ? 'id' : 'form_id'} = ?`,
            [id],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              completed++;
              if (completed === total) {
                db.run('COMMIT', (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              }
            }
          );
        });
      });
    });
  }

  /**
   * البحث عن نموذج بواسطة المعرف
   * @param {number} id - معرف النموذج
   * @returns {Promise<Object>}
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM forms WHERE id = ?', [id], (err, row) => {
        if (err) {
          logger.error('خطأ في البحث عن النموذج:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * البحث عن النماذج حسب الحالة
   * @param {string} status - حالة النموذج
   * @returns {Promise<Array>}
   */
  static async findByStatus(status) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM forms WHERE status = ?', [status], (err, rows) => {
        if (err) {
          logger.error('خطأ في البحث عن النماذج:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * جلب جميع النماذج
   * @returns {Promise<Array>}
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM forms ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          logger.error('خطأ في جلب النماذج:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * البحث عن النماذج في نطاق تاريخي
   * @param {string} startDate - تاريخ البداية
   * @param {string} endDate - تاريخ النهاية
   * @returns {Promise<Array>}
   */
  static async findByDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM forms WHERE preview_date BETWEEN ? AND ? ORDER BY preview_date',
        [startDate, endDate],
        (err, rows) => {
          if (err) {
            logger.error('خطأ في البحث عن النماذج:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * البحث عن النماذج حسب نوع المنشأة
   * @param {string} facilityNature - نوع المنشأة
   * @returns {Promise<Array>}
   */
  static async findByFacilityNature(facilityNature) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM forms WHERE facility_nature = ? ORDER BY created_at DESC',
        [facilityNature],
        (err, rows) => {
          if (err) {
            logger.error('خطأ في البحث عن النماذج:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * البحث عن النماذج حسب نوع الخدمة
   * @param {string} serviceType - نوع الخدمة
   * @returns {Promise<Array>}
   */
  static async findByServiceType(serviceType) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM forms WHERE service_type = ? ORDER BY created_at DESC',
        [serviceType],
        (err, rows) => {
          if (err) {
            logger.error('خطأ في البحث عن النماذج:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = Form; 