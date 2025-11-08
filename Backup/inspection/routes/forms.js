const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const { verifyToken, checkRole } = require('../middlewares/auth');
const config = require('../config');
const logger = require('../utils/logger');
const { validate } = require('../middlewares/validation');
const EncryptionManager = require('../utils/EncryptionManager');
const dbManager = require('../utils/DatabaseManager');

const encryptionManager = new EncryptionManager();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = config.upload.allowedTypes;
    const extname = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(extname)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

// التحقق من صحة بيانات النموذج
const formValidation = [
  body('occupancy_name').trim().notEmpty().withMessage('اسم المنشأة مطلوب'),
  body('facility_nature').trim().notEmpty().withMessage('طبيعة المنشأة مطلوبة'),
  body('service_type').trim().notEmpty().withMessage('نوع الخدمة مطلوب'),
  body('preview_date').isISO8601().toDate().withMessage('تاريخ المعاينة غير صالح')
];

// الحقول الحساسة التي تحتاج إلى تشفير
const sensitiveFields = {
  forms: ['file_no', 'reference_no', 'occupancy_name'],
  addresses: ['shop_flat', 'building', 'road', 'block'],
  inspectors: ['name', 'signature_path'],
  officers: ['signature_path']
};

// جلب جميع النماذج
router.get('/', verifyToken, async (req, res) => {
  try {
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

    const rows = await dbManager.query(query);
    
    // فك تشفير البيانات الحساسة لكل نموذج
    const forms = await Promise.all(rows.map(async form => {
      const decryptedForm = await encryptionManager.decryptFields(form, sensitiveFields.forms);
      return decryptedForm;
    }));

    res.json(forms);
  } catch (error) {
    logger.error('خطأ في جلب النماذج:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء جلب النماذج'
    });
  }
});

// جلب نموذج محدد
router.get('/:id', verifyToken, async (req, res) => {
  const formId = req.params.id;
  
  try {
    // استعلام واحد مجمع لجلب البيانات الأساسية
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

    const row = await dbManager.queryOne(query, [formId]);
    if (!row) {
      throw new Error('النموذج غير موجود');
    }

    // فك تشفير البيانات الحساسة
    const form = await encryptionManager.decryptFields(row, sensitiveFields.forms);
    
    if (row.shop_flat || row.building || row.road || row.block) {
      const addressFields = await encryptionManager.decryptFields(
        { shop_flat: row.shop_flat, building: row.building, road: row.road, block: row.block },
        sensitiveFields.addresses
      );
      Object.assign(form, addressFields);
    }
    
    if (row.inspector_name || row.inspector_signature) {
      const inspectorFields = await encryptionManager.decryptFields(
        { name: row.inspector_name, signature_path: row.inspector_signature },
        sensitiveFields.inspectors
      );
      form.inspector = inspectorFields;
    }
    
    if (row.officer_signature) {
      const officerFields = await encryptionManager.decryptFields(
        { signature_path: row.officer_signature },
        sensitiveFields.officers
      );
      form.officer = {
        reviewed_notes: row.reviewed_notes,
        date: row.officer_date,
        signature_path: officerFields.signature_path
      };
    }

    // جلب الصور
    const photos = await dbManager.query(
      'SELECT id, file_path, hash, metadata, upload_date FROM photos WHERE form_id = ?',
      [formId]
    );

    // جلب المتطلبات المخصصة
    const customRequirements = await dbManager.query(
      'SELECT requirement FROM custom_requirements WHERE form_id = ? ORDER BY order_index',
      [formId]
    );

    // جلب المعايير
    const criteria = await dbManager.query(
      'SELECT id, name, description, is_critical as isCritical FROM custom_criteria WHERE form_id = ? ORDER BY order_index',
      [formId]
    );

    // جلب التوصيات
    const recommendations = await dbManager.query(
      'SELECT id, text, priority FROM custom_recommendations WHERE form_id = ? ORDER BY order_index',
      [formId]
    );

    res.json({
      ...form,
      photos,
      customRequirements: customRequirements.map(row => row.requirement),
      criteria,
      recommendations
    });

  } catch (error) {
    logger.error('خطأ في جلب النموذج:', error);
    res.status(error.message === 'النموذج غير موجود' ? 404 : 500).json({
      error: error.message
    });
  }
});

// إنشاء نموذج جديد
router.post('/', verifyToken, checkRole(['admin', 'inspector']), formValidation, validate, async (req, res) => {
  const {
    file_no,
    reference_no,
    occupancy_name,
    facility_nature,
    service_type,
    preview_date,
    address
  } = req.body;

  try {
    // تشفير البيانات الحساسة
    const encryptedForm = await encryptionManager.encryptFields(
      { file_no, reference_no, occupancy_name },
      sensitiveFields.forms
    );

    let encryptedAddress;
    if (address) {
      encryptedAddress = await encryptionManager.encryptFields(
        { shop_flat: address.shop_flat, building: address.building, road: address.road, block: address.block },
        sensitiveFields.addresses
      );
    }

    let formId;
    await dbManager.transaction(async (db) => {
      // إدراج النموذج
      const result = await dbManager.execute(
        `INSERT INTO forms (
          file_no, reference_no, occupancy_name, facility_nature,
          service_type, preview_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'draft')`,
        [
          encryptedForm.file_no,
          encryptedForm.reference_no,
          encryptedForm.occupancy_name,
          facility_nature,
          service_type,
          preview_date
        ]
      );

      formId = result.lastID;

      // إدراج العنوان إذا وجد
      if (address) {
        await dbManager.execute(
          `INSERT INTO addresses (
            form_id, shop_flat, building, road, block, area
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            formId,
            encryptedAddress.shop_flat,
            encryptedAddress.building,
            encryptedAddress.road,
            encryptedAddress.block,
            address.area
          ]
        );
      }
    });

    res.status(201).json({
      id: formId,
      message: 'تم إنشاء النموذج بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في إنشاء النموذج:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء إنشاء النموذج'
    });
  }
});

// تحديث نموذج
router.put('/:id', verifyToken, checkRole(['admin', 'inspector']), formValidation, validate, async (req, res) => {
  const formId = req.params.id;
  const {
    file_no,
    reference_no,
    occupancy_name,
    facility_nature,
    service_type,
    preview_date,
    address,
    requirements,
    observations,
    inspection_results,
    inspector
  } = req.body;

  try {
    // تشفير البيانات الحساسة
    const encryptedForm = await encryptionManager.encryptFields(
      { file_no, reference_no, occupancy_name },
      sensitiveFields.forms
    );

    let encryptedAddress;
    if (address) {
      encryptedAddress = await encryptionManager.encryptFields(
        { shop_flat: address.shop_flat, building: address.building, road: address.road, block: address.block },
        sensitiveFields.addresses
      );
    }

    let encryptedInspector;
    if (inspector) {
      encryptedInspector = await encryptionManager.encryptFields(
        { name: inspector.name, signature_path: inspector.signature_path },
        sensitiveFields.inspectors
      );
    }

    await dbManager.transaction(async (db) => {
      // تحديث النموذج
      await dbManager.execute(
        `UPDATE forms SET
          file_no = ?,
          reference_no = ?,
          occupancy_name = ?,
          facility_nature = ?,
          service_type = ?,
          preview_date = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          encryptedForm.file_no,
          encryptedForm.reference_no,
          encryptedForm.occupancy_name,
          facility_nature,
          service_type,
          preview_date,
          formId
        ]
      );

      // تحديث أو إدراج العنوان
      if (address) {
        await dbManager.execute(
          `INSERT OR REPLACE INTO addresses (
            form_id, shop_flat, building, road, block, area
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            formId,
            encryptedAddress.shop_flat,
            encryptedAddress.building,
            encryptedAddress.road,
            encryptedAddress.block,
            address.area
          ]
        );
      }

      // تحديث أو إدراج المتطلبات
      if (requirements) {
        await dbManager.execute(
          `INSERT OR REPLACE INTO requirements (
            form_id, req1, req2, req3, req4, req5, req6, req7,
            req8, req9, req10, req11, req12, req13, req14, req15
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            formId,
            requirements.req1 ? 1 : 0,
            requirements.req2 ? 1 : 0,
            requirements.req3 ? 1 : 0,
            requirements.req4 ? 1 : 0,
            requirements.req5 ? 1 : 0,
            requirements.req6 ? 1 : 0,
            requirements.req7 ? 1 : 0,
            requirements.req8 ? 1 : 0,
            requirements.req9 ? 1 : 0,
            requirements.req10 ? 1 : 0,
            requirements.req11 ? 1 : 0,
            requirements.req12 ? 1 : 0,
            requirements.req13 ? 1 : 0,
            requirements.req14 ? 1 : 0,
            requirements.req15 ? 1 : 0
          ]
        );
      }

      // تحديث أو إدراج الملاحظات
      if (observations) {
        await dbManager.execute(
          `INSERT OR REPLACE INTO observations (
            form_id, observation1, observation2, observation3,
            observation4, observation5, observation6
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            formId,
            observations.observation1,
            observations.observation2,
            observations.observation3,
            observations.observation4,
            observations.observation5,
            observations.observation6
          ]
        );
      }

      // تحديث أو إدراج نتائج التفتيش
      if (inspection_results) {
        await dbManager.execute(
          `INSERT OR REPLACE INTO inspection_results (
            form_id, is_compliant, correction_days
          ) VALUES (?, ?, ?)`,
          [
            formId,
            inspection_results.is_compliant ? 1 : 0,
            inspection_results.correction_days
          ]
        );
      }

      // تحديث أو إدراج بيانات المفتش
      if (inspector) {
        await dbManager.execute(
          `INSERT OR REPLACE INTO inspectors (
            form_id, name, signature_path
          ) VALUES (?, ?, ?)`,
          [
            formId,
            encryptedInspector.name,
            encryptedInspector.signature_path
          ]
        );
      }
    });

    res.json({
      message: 'تم تحديث النموذج بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في تحديث النموذج:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء تحديث النموذج'
    });
  }
});

// حذف نموذج
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  const formId = req.params.id;

  try {
    await dbManager.transaction(async (db) => {
      // حذف جميع البيانات المرتبطة
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

      for (const table of tables) {
        await dbManager.execute(`DELETE FROM ${table} WHERE form_id = ?`, [formId]);
      }
    });

    res.json({
      message: 'تم حذف النموذج بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في حذف النموذج:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء حذف النموذج'
    });
  }
});

// Upload photos
router.post('/:id/photos',
  verifyToken,
  checkRole(['inspector', 'admin']),
  upload.array('photos', 10),
  async (req, res) => {
    try {
      const form = await new Promise((resolve, reject) => {
        dbManager.queryOne('SELECT * FROM forms WHERE id = ?', [req.params.id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (!form) {
        // Delete uploaded files if form doesn't exist
        for (const file of req.files) {
          await fs.unlink(file.path);
        }
        return res.status(404).json({ error: 'النموذج غير موجود' });
      }

      // Check permissions
      if (req.user.role === 'inspector' && form.created_by !== req.user.id) {
        // Delete uploaded files if user doesn't have permission
        for (const file of req.files) {
          await fs.unlink(file.path);
        }
        return res.status(403).json({ error: 'غير مصرح لك بإضافة صور لهذا النموذج' });
      }

      // Save photos to database
      for (const file of req.files) {
        await new Promise((resolve, reject) => {
          dbManager.execute(
            'INSERT INTO photos (form_id, file_path, uploaded_by, uploaded_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            [req.params.id, file.filename, req.user.id],
            (err) => {
              if (err) reject(err);
              resolve();
            }
          );
        });
      }

      logger.info(`تم رفع ${req.files.length} صور للنموذج ${req.params.id} بواسطة ${req.user.username}`);
      res.json({
        message: 'تم رفع الصور بنجاح',
        count: req.files.length
      });
    } catch (error) {
      // Delete uploaded files if there was an error
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error('خطأ في حذف الملف المؤقت:', unlinkError);
        }
      }
      logger.error('خطأ في رفع الصور:', error);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// Get form photos
router.get('/:id/photos', verifyToken, async (req, res) => {
  try {
    const form = await new Promise((resolve, reject) => {
      dbManager.queryOne('SELECT * FROM forms WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!form) {
      return res.status(404).json({ error: 'النموذج غير موجود' });
    }

    // Check permissions
    if (req.user.role === 'inspector' && form.created_by !== req.user.id) {
      return res.status(403).json({ error: 'غير مصرح لك بالوصول إلى صور هذا النموذج' });
    }

    const photos = await new Promise((resolve, reject) => {
      dbManager.query(
        'SELECT p.*, u.username as uploader_name FROM photos p LEFT JOIN users u ON p.uploaded_by = u.id WHERE p.form_id = ? ORDER BY p.uploaded_at DESC',
        [req.params.id],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    res.json(photos);
  } catch (error) {
    logger.error('خطأ في جلب الصور:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Delete photo
router.delete('/:formId/photos/:photoId',
  verifyToken,
  checkRole(['inspector', 'admin']),
  async (req, res) => {
    try {
      const photo = await new Promise((resolve, reject) => {
        dbManager.queryOne(
          'SELECT p.*, f.created_by as form_creator FROM photos p LEFT JOIN forms f ON p.form_id = f.id WHERE p.id = ? AND p.form_id = ?',
          [req.params.photoId, req.params.formId],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!photo) {
        return res.status(404).json({ error: 'الصورة غير موجودة' });
      }

      // Check permissions
      if (req.user.role === 'inspector' && photo.form_creator !== req.user.id) {
        return res.status(403).json({ error: 'غير مصرح لك بحذف هذه الصورة' });
      }

      // Delete file
      await fs.unlink(path.join(config.upload.path, photo.file_path));

      // Delete from database
      await new Promise((resolve, reject) => {
        dbManager.execute('DELETE FROM photos WHERE id = ?', [req.params.photoId], (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      logger.info(`تم حذف الصورة ${req.params.photoId} بواسطة ${req.user.username}`);
      res.json({ message: 'تم حذف الصورة بنجاح' });
    } catch (error) {
      logger.error('خطأ في حذف الصورة:', error);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

module.exports = router; 