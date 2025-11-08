const logger = require('../utils/logger');
const { db } = require('../utils/DatabaseManager');
const EncryptionManager = require('../utils/EncryptionManager');
const FileValidator = require('../utils/FileValidator');
const config = require('../config');
const fs = require('fs');
const path = require('path');

const encryptionManager = new EncryptionManager();
const fileValidator = new FileValidator(config);

// تحديد الحقول الحساسة
const sensitiveFields = {
  forms: ['file_no', 'reference_no', 'occupancy_name'],
  addresses: ['shop_flat', 'building', 'road', 'block'],
  inspectors: ['name', 'signature_path'],
  officers: ['signature_path']
};

/**
 * جلب جميع النماذج
 */
exports.getAllForms = async (req, res) => {
  try {
    const forms = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          f.id,
          f.file_no,
          f.reference_no,
          f.occupancy_name,
          f.facility_nature,
          f.service_type,
          f.preview_date,
          f.status,
          f.created_at,
          a.area,
          COUNT(p.id) as photo_count
        FROM forms f
        LEFT JOIN addresses a ON f.id = a.form_id
        LEFT JOIN photos p ON f.id = p.form_id
        GROUP BY f.id
        ORDER BY f.created_at DESC`;

      db.all(query, [], async (err, rows) => {
        if (err) reject(err);
        
        // فك تشفير البيانات الحساسة
        const decryptedForms = await Promise.all(rows.map(async form => {
          const decrypted = await encryptionManager.decryptFields(form, sensitiveFields.forms);
          return decrypted;
        }));
        
        resolve(decryptedForms);
      });
    });

    res.json(forms);
  } catch (error) {
    logger.error('خطأ في جلب النماذج:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * جلب نموذج بواسطة المعرف
 */
exports.getFormById = async (req, res) => {
  const formId = req.params.id;
  
  try {
    const form = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          f.*,
          a.shop_flat, a.building, a.road, a.block, a.area,
          r.*,
          o.*,
          ir.is_compliant, ir.correction_days,
          i.name as inspector_name, i.signature_path as inspector_signature,
          of.reviewed_notes, of.date as officer_date, of.signature_path as officer_signature,
          COUNT(DISTINCT p.id) as photo_count,
          COUNT(DISTINCT cr.id) as custom_req_count,
          COUNT(DISTINCT cc.id) as criteria_count
        FROM forms f
        LEFT JOIN addresses a ON f.id = a.form_id
        LEFT JOIN requirements r ON f.id = r.form_id
        LEFT JOIN observations o ON f.id = o.form_id
        LEFT JOIN inspection_results ir ON f.id = ir.form_id
        LEFT JOIN inspectors i ON f.id = i.form_id
        LEFT JOIN officers of ON f.id = of.form_id
        LEFT JOIN photos p ON f.id = p.form_id
        LEFT JOIN custom_requirements cr ON f.id = cr.form_id
        LEFT JOIN custom_criteria cc ON f.id = cc.form_id
        WHERE f.id = ?
        GROUP BY f.id`;

      db.get(query, [formId], async (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error('النموذج غير موجود'));
        
        try {
          // فك تشفير البيانات الحساسة
          const decryptedForm = await encryptionManager.decryptFields(row, sensitiveFields.forms);
          
          if (row.shop_flat || row.building || row.road || row.block) {
            const addressFields = await encryptionManager.decryptFields(
              { shop_flat: row.shop_flat, building: row.building, road: row.road, block: row.block },
              sensitiveFields.addresses
            );
            Object.assign(decryptedForm, addressFields);
          }
          
          if (row.inspector_name || row.inspector_signature) {
            const inspectorFields = await encryptionManager.decryptFields(
              { name: row.inspector_name, signature_path: row.inspector_signature },
              sensitiveFields.inspectors
            );
            decryptedForm.inspector = inspectorFields;
          }
          
          if (row.officer_signature) {
            const officerFields = await encryptionManager.decryptFields(
              { signature_path: row.officer_signature },
              sensitiveFields.officers
            );
            decryptedForm.officer = {
              reviewed_notes: row.reviewed_notes,
              date: row.officer_date,
              signature_path: officerFields.signature_path
            };
          }
          
          resolve(decryptedForm);
        } catch (error) {
          reject(error);
        }
      });
    });

    // جلب الصور
    const photos = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, file_path, hash, metadata, upload_date FROM photos WHERE form_id = ?',
        [formId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // جلب المتطلبات المخصصة
    const customRequirements = await new Promise((resolve, reject) => {
      db.all(
        'SELECT requirement FROM custom_requirements WHERE form_id = ? ORDER BY order_index',
        [formId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows.map(row => row.requirement) || []);
        }
      );
    });

    // جلب المعايير
    const criteria = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, description, is_critical as isCritical 
         FROM custom_criteria WHERE form_id = ? ORDER BY order_index`,
        [formId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // جلب التوصيات
    const recommendations = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, text, priority FROM custom_recommendations WHERE form_id = ? ORDER BY order_index',
        [formId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // تجميع كل البيانات
    const formData = {
      ...form,
      photos,
      customRequirements,
      criteria,
      recommendations
    };

    res.json(formData);

  } catch (error) {
    logger.error('خطأ في جلب النموذج:', error);
    res.status(error.message === 'النموذج غير موجود' ? 404 : 500).json({
      error: error.message
    });
  }
};

/**
 * إنشاء نموذج جديد (مسودة)
 */
exports.createDraft = async (req, res) => {
  const {
    file_no,
    reference_no,
    occupancy_name,
    facility_nature,
    service_type,
    preview_date
  } = req.body;

  if (!occupancy_name) {
    return res.status(400).json({ error: 'اسم المنشأة مطلوب' });
  }

  try {
    // تشفير البيانات الحساسة
    const encryptedData = await encryptionManager.encryptFields(
      { file_no, reference_no, occupancy_name },
      sensitiveFields.forms
    );

    const formId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO forms (
          file_no, reference_no, occupancy_name, facility_nature, 
          service_type, preview_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
        [
          encryptedData.file_no,
          encryptedData.reference_no,
          encryptedData.occupancy_name,
          facility_nature,
          service_type,
          preview_date
        ],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    res.status(201).json({
      id: formId,
      message: 'تم إنشاء المسودة بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في إنشاء المسودة:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * حذف نموذج
 */
exports.deleteForm = async (req, res) => {
  const formId = req.params.id;

  try {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const tables = [
          'photos', 'officers', 'inspectors', 'inspection_results',
          'observations', 'requirements', 'addresses', 'custom_requirements',
          'custom_criteria', 'custom_recommendations', 'forms'
        ];

        let completed = 0;
        const total = tables.length;

        tables.forEach(table => {
          db.run(`DELETE FROM ${table} WHERE ${table === 'forms' ? 'id' : 'form_id'} = ?`,
            [formId],
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

    res.json({
      message: `تم حذف النموذج رقم ${formId} بنجاح`
    });

  } catch (error) {
    logger.error('خطأ في حذف النموذج:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * تحديث ترتيب المتطلبات المخصصة
 */
exports.updateRequirementsOrder = async (req, res) => {
  const formId = req.params.id;
  const { requirements } = req.body;

  if (!Array.isArray(requirements)) {
    return res.status(400).json({ error: 'بيانات المتطلبات غير صالحة' });
  }

  try {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const stmt = db.prepare(
          'UPDATE custom_requirements SET order_index = ? WHERE form_id = ? AND requirement = ?'
        );

        requirements.forEach((req, index) => {
          stmt.run([index, formId, req], (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
          });
        });

        stmt.finalize();

        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    res.json({
      message: 'تم تحديث ترتيب المتطلبات بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في تحديث ترتيب المتطلبات:', error);
    res.status(500).json({ error: error.message });
  }
}; 