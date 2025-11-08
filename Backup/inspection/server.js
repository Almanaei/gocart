// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const EncryptionManager = require('./utils/EncryptionManager');
const FileValidator = require('./utils/FileValidator');
const BackupManager = require('./utils/BackupManager');
const { promisify } = require('util');

// Initialize app
const app = express();
const port = config.app.port;

console.log('تهيئة التطبيق...');
console.log('المنفذ:', port);

// إنشاء مدير النسخ الاحتياطي
const backupManager = new BackupManager();
console.log('تم إنشاء مدير النسخ الاحتياطي');

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(cookieParser(config.app.cookieSecret));
console.log('تم تهيئة الوسائط الأساسية');

// إعداد حماية CSRF
const csrfProtection = csrf({
  cookie: {
    key: '_csrf-token',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: true
  }
});

// تطبيق حماية CSRF على جميع طلبات POST/PUT/DELETE
app.use((req, res, next) => {
  if (req.method === 'GET') {
    next();
  } else {
    csrfProtection(req, res, next);
  }
});

// إضافة معالج لإرسال رمز CSRF للعميل
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// إضافة معالج أخطاء CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn('محاولة طلب غير صالح - خطأ في رمز CSRF');
    return res.status(403).json({
      error: 'رمز الحماية غير صالح',
      message: 'يرجى تحديث الصفحة والمحاولة مرة أخرى'
    });
  }
  next(err);
});

// Set up rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Set up request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, config.upload.path);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxSize
  }
});

// Connect to SQLite database
const db = new sqlite3.Database(config.database.path, (err) => {
  if (err) {
    logger.error('Error connecting to database:', err.message);
  } else {
    logger.info('Connected to the SQLite database.');
    initializeDatabase();
    // بدء النسخ الاحتياطي التلقائي
    backupManager.startAutoBackup(config.database.path);
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      token_version INTEGER DEFAULT 0,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // إضافة فهارس للمستخدمين
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);

    // إنشاء مستخدم مشرف افتراضي
    const bcrypt = require('bcryptjs');
    const defaultAdmin = {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    };

    db.get('SELECT id FROM users WHERE username = ?', [defaultAdmin.username], async (err, user) => {
      if (err) {
        logger.error('خطأ في التحقق من وجود المشرف:', err);
        return;
      }

      if (!user) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);

          db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [defaultAdmin.username, hashedPassword, defaultAdmin.role],
            (err) => {
              if (err) {
                logger.error('خطأ في إنشاء المشرف:', err);
              } else {
                logger.info('تم إنشاء حساب المشرف الافتراضي');
              }
            }
          );
        } catch (error) {
          logger.error('خطأ في تشفير كلمة المرور:', error);
        }
      }
    });

    // Create forms table
    db.run(`CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_no TEXT,
      reference_no TEXT,
      occupancy_name TEXT NOT NULL,
      facility_nature TEXT,
      service_type TEXT,
      preview_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'draft'
    )`);
    
    // إضافة فهارس للنماذج
    db.run(`CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_forms_dates ON forms(preview_date, created_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_forms_reference ON forms(file_no, reference_no)`);

    // Create address table
    db.run(`CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      shop_flat TEXT,
      building TEXT,
      road TEXT,
      block TEXT,
      area TEXT,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create requirements table
    db.run(`CREATE TABLE IF NOT EXISTS requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      req1 BOOLEAN DEFAULT 0,
      req2 BOOLEAN DEFAULT 0,
      req3 BOOLEAN DEFAULT 0,
      req4 BOOLEAN DEFAULT 0,
      req5 BOOLEAN DEFAULT 0,
      req6 BOOLEAN DEFAULT 0,
      req7 BOOLEAN DEFAULT 0,
      req8 BOOLEAN DEFAULT 0,
      req9 BOOLEAN DEFAULT 0,
      req10 BOOLEAN DEFAULT 0,
      req11 BOOLEAN DEFAULT 0,
      req12 BOOLEAN DEFAULT 0,
      req13 BOOLEAN DEFAULT 0,
      req14 BOOLEAN DEFAULT 0,
      req15 BOOLEAN DEFAULT 0,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create observations table
    db.run(`CREATE TABLE IF NOT EXISTS observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      observation1 TEXT,
      observation2 TEXT,
      observation3 TEXT,
      observation4 TEXT,
      observation5 TEXT,
      observation6 TEXT,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create inspection_results table
    db.run(`CREATE TABLE IF NOT EXISTS inspection_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      is_compliant BOOLEAN,
      correction_days INTEGER,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create inspectors table
    db.run(`CREATE TABLE IF NOT EXISTS inspectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      name TEXT,
      signature_path TEXT,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create officers table
    db.run(`CREATE TABLE IF NOT EXISTS officers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      reviewed_notes BOOLEAN DEFAULT 0,
      date DATE,
      signature_path TEXT,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create photos table
    db.run(`CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      file_path TEXT,
      hash TEXT,
      metadata TEXT,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);
    
    // إضافة فهرس للصور
    db.run(`CREATE INDEX IF NOT EXISTS idx_photos_form ON photos(form_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_photos_hash ON photos(hash)`);

    // Create custom_requirements table
    db.run(`CREATE TABLE IF NOT EXISTS custom_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      requirement TEXT NOT NULL,
      order_index INTEGER,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create custom_observations table
    db.run(`CREATE TABLE IF NOT EXISTS custom_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      observation TEXT NOT NULL,
      is_critical BOOLEAN DEFAULT 0,
      order_index INTEGER,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create custom_criteria table
    db.run(`CREATE TABLE IF NOT EXISTS custom_criteria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      is_critical BOOLEAN DEFAULT 0,
      order_index INTEGER,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);

    // Create custom_recommendations table
    db.run(`CREATE TABLE IF NOT EXISTS custom_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER,
      text TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      order_index INTEGER,
      FOREIGN KEY (form_id) REFERENCES forms (id)
    )`);
  });
}

const encryptionManager = new EncryptionManager();

// تحديد الحقول الحساسة التي تحتاج إلى تشفير
const sensitiveFields = {
  forms: ['file_no', 'reference_no', 'occupancy_name'],
  addresses: ['shop_flat', 'building', 'road', 'block'],
  inspectors: ['name', 'signature_path'],
  officers: ['signature_path']
};

// API Routes
// Get all forms
app.get('/api/forms', (req, res) => {
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

  db.all(query, [], (err, rows) => {
    if (err) {
      logger.error('خطأ في جلب النماذج:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get form by ID
app.get('/api/forms/:id', async (req, res) => {
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

    const formRow = await new Promise((resolve, reject) => {
      db.get(query, [formId], async (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("النموذج غير موجود"));
        
        try {
          // فك تشفير الحقول الحساسة
          const decryptedForm = await encryptionManager.decryptFields(row, sensitiveFields.forms);
          
          // فك تشفير بيانات العنوان
          if (row.shop_flat || row.building || row.road || row.block) {
            const addressFields = await encryptionManager.decryptFields(
              { shop_flat: row.shop_flat, building: row.building, road: row.road, block: row.block },
              sensitiveFields.addresses
            );
            Object.assign(decryptedForm, addressFields);
          }
          
          // فك تشفير بيانات المفتش
          if (row.inspector_name || row.inspector_signature) {
            const inspectorFields = await encryptionManager.decryptFields(
              { name: row.inspector_name, signature_path: row.inspector_signature },
              sensitiveFields.inspectors
            );
            decryptedForm.inspector = inspectorFields;
          }
          
          // فك تشفير بيانات الضابط
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
    
    // جلب الصور في استعلام منفصل
    const photos = await new Promise((resolve, reject) => {
      db.all(`SELECT id, file_path, hash, metadata, upload_date FROM photos WHERE form_id = ?`, 
        [formId], (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
      });
    });
    
    // جلب المتطلبات المخصصة في استعلام منفصل
    const customRequirements = await new Promise((resolve, reject) => {
      db.all(`SELECT requirement FROM custom_requirements WHERE form_id = ? ORDER BY order_index`, 
        [formId], (err, rows) => {
          if (err) reject(err);
          resolve(rows.map(row => row.requirement) || []);
      });
    });
    
    // جلب المعايير في استعلام منفصل
    const criteria = await new Promise((resolve, reject) => {
      db.all(`SELECT id, name, description, is_critical as isCritical FROM custom_criteria 
              WHERE form_id = ? ORDER BY order_index`, 
        [formId], (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
      });
    });
    
    // جلب التوصيات في استعلام منفصل
    const recommendations = await new Promise((resolve, reject) => {
      db.all(`SELECT id, text, priority FROM custom_recommendations 
              WHERE form_id = ? ORDER BY order_index`, 
        [formId], (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
      });
    });
    
    // تجميع كل البيانات
    const formData = {
      ...formRow,
      photos,
      customRequirements,
      criteria,
      recommendations
    };
    
    res.json(formData);
    
  } catch (error) {
    logger.error('خطأ في استرجاع بيانات النموذج:', error);
    res.status(error.message === "النموذج غير موجود" ? 404 : 500).json({ 
      error: error.message 
    });
  }
});

// Create new form (draft)
app.post('/api/forms/draft', async (req, res) => {
  const {
    file_no,
    reference_no,
    occupancy_name,
    facility_nature,
    service_type,
    preview_date
  } = req.body;
  
  if (!occupancy_name) {
    return res.status(400).json({ error: "Occupancy name is required" });
  }
  
  try {
    // تشفير البيانات الحساسة
    const encryptedData = await encryptionManager.encryptFields(
      { file_no, reference_no, occupancy_name },
      sensitiveFields.forms
    );
    
    db.run(`INSERT INTO forms (file_no, reference_no, occupancy_name, facility_nature, service_type, preview_date, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'draft')`, 
      [encryptedData.file_no, encryptedData.reference_no, encryptedData.occupancy_name, 
       facility_nature, service_type, preview_date], 
      function(err) {
        if (err) {
          logger.error('خطأ في إنشاء النموذج:', err);
          return res.status(500).json({ error: err.message });
        }
        
        const formId = this.lastID;
        res.json({
          id: formId,
          message: "Draft form created successfully"
        });
      }
    );
  } catch (error) {
    logger.error('خطأ في تشفير البيانات:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit complete form
app.post('/api/forms/submit', async (req, res) => {
  const {
    form,
    address,
    requirements,
    customRequirements,
    observations,
    customObservations,
    results,
    criteria,
    recommendations,
    inspector
  } = req.body;
  
  if (!form || !form.occupancy_name) {
    return res.status(400).json({ error: "Form data with occupancy name is required" });
  }
  
  try {
    // تشفير البيانات الحساسة
    const encryptedForm = await encryptionManager.encryptFields(
      { file_no: form.file_no, reference_no: form.reference_no, occupancy_name: form.occupancy_name },
      sensitiveFields.forms
    );
    
    let encryptedAddress;
    if (address) {
      encryptedAddress = await encryptionManager.encryptFields(
        { shop_flat: address.shop_flat, building: address.building, road: address.road, block: address.block },
        sensitiveFields.addresses
      );
    }
    
    const formId = await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        try {
          // إعداد الاستعلامات المجهزة
          const formStmt = db.prepare(form.id 
            ? `UPDATE forms SET file_no = ?, reference_no = ?, occupancy_name = ?, 
                facility_nature = ?, service_type = ?, preview_date = ?, 
                status = 'submitted', updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?`
            : `INSERT INTO forms (file_no, reference_no, occupancy_name, facility_nature, 
                service_type, preview_date, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'submitted')`
          );
          
          const addressStmt = db.prepare(address?.id 
            ? `UPDATE addresses SET shop_flat = ?, building = ?, road = ?, block = ?, area = ? 
                WHERE id = ?`
            : `INSERT INTO addresses (form_id, shop_flat, building, road, block, area) 
                VALUES (?, ?, ?, ?, ?, ?)`
          );
          
          const requirementsStmt = db.prepare(requirements?.id
            ? `UPDATE requirements SET req1 = ?, req2 = ?, req3 = ?, req4 = ?, req5 = ?, 
                req6 = ?, req7 = ?, req8 = ?, req9 = ?, req10 = ?, req11 = ?, req12 = ?, 
                req13 = ?, req14 = ?, req15 = ? WHERE id = ?`
            : `INSERT INTO requirements (form_id, req1, req2, req3, req4, req5, req6, req7, 
                req8, req9, req10, req11, req12, req13, req14, req15) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          );
          
          // تنفيذ استعلام النموذج
          const formParams = form.id 
            ? [encryptedForm.file_no, encryptedForm.reference_no, encryptedForm.occupancy_name,
               form.facility_nature, form.service_type, form.preview_date, form.id]
            : [encryptedForm.file_no, encryptedForm.reference_no, encryptedForm.occupancy_name,
               form.facility_nature, form.service_type, form.preview_date];
          
          formStmt.run(formParams, function(err) {
            if (err) throw err;
            
            const formId = form.id || this.lastID;
            
            // تنفيذ استعلام العنوان
            if (address) {
              const addressParams = address.id 
                ? [encryptedAddress.shop_flat, encryptedAddress.building, encryptedAddress.road,
                   encryptedAddress.block, address.area, address.id]
                : [formId, encryptedAddress.shop_flat, encryptedAddress.building,
                   encryptedAddress.road, encryptedAddress.block, address.area];
              
              addressStmt.run(addressParams, function(err) {
                if (err) throw err;
              });
            }
            
            // تنفيذ استعلام المتطلبات
            if (requirements) {
              const reqParams = requirements.id 
                ? [requirements.req1 ? 1 : 0, requirements.req2 ? 1 : 0, requirements.req3 ? 1 : 0,
                   requirements.req4 ? 1 : 0, requirements.req5 ? 1 : 0, requirements.req6 ? 1 : 0,
                   requirements.req7 ? 1 : 0, requirements.req8 ? 1 : 0, requirements.req9 ? 1 : 0,
                   requirements.req10 ? 1 : 0, requirements.req11 ? 1 : 0, requirements.req12 ? 1 : 0,
                   requirements.req13 ? 1 : 0, requirements.req14 ? 1 : 0, requirements.req15 ? 1 : 0,
                   requirements.id]
                : [formId, requirements.req1 ? 1 : 0, requirements.req2 ? 1 : 0, requirements.req3 ? 1 : 0,
                   requirements.req4 ? 1 : 0, requirements.req5 ? 1 : 0, requirements.req6 ? 1 : 0,
                   requirements.req7 ? 1 : 0, requirements.req8 ? 1 : 0, requirements.req9 ? 1 : 0,
                   requirements.req10 ? 1 : 0, requirements.req11 ? 1 : 0, requirements.req12 ? 1 : 0,
                   requirements.req13 ? 1 : 0, requirements.req14 ? 1 : 0, requirements.req15 ? 1 : 0];
              
              requirementsStmt.run(reqParams, function(err) {
                if (err) throw err;
              });
            }
            
            // تنفيذ عمليات الإدراج المجمعة
            if (customRequirements?.length > 0) {
              const batchInsert = db.prepare(
                `INSERT INTO custom_requirements (form_id, requirement, order_index) VALUES (?, ?, ?)`
              );
              
              db.run('BEGIN BATCH');
              customRequirements.forEach((req, index) => {
                batchInsert.run([formId, req, index]);
              });
              db.run('COMMIT BATCH');
              batchInsert.finalize();
            }
            
            if (criteria?.length > 0) {
              const batchInsert = db.prepare(
                `INSERT INTO custom_criteria (form_id, name, description, is_critical, order_index) 
                 VALUES (?, ?, ?, ?, ?)`
              );
              
              db.run('BEGIN BATCH');
              criteria.forEach((criterion, index) => {
                batchInsert.run([
                  formId,
                  criterion.name,
                  criterion.description,
                  criterion.isCritical ? 1 : 0,
                  index
                ]);
              });
              db.run('COMMIT BATCH');
              batchInsert.finalize();
            }
            
            if (recommendations?.length > 0) {
              const batchInsert = db.prepare(
                `INSERT INTO custom_recommendations (form_id, text, priority, order_index) 
                 VALUES (?, ?, ?, ?)`
              );
              
              db.run('BEGIN BATCH');
              recommendations.forEach((recommendation, index) => {
                batchInsert.run([
                  formId,
                  recommendation.text,
                  recommendation.priority,
                  index
                ]);
              });
              db.run('COMMIT BATCH');
              batchInsert.finalize();
            }
            
            // تنظيف الاستعلامات المجهزة
            formStmt.finalize();
            addressStmt.finalize();
            requirementsStmt.finalize();
            
            db.run('COMMIT', (err) => {
              if (err) reject(err);
              else resolve(formId);
            });
          });
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
    
    res.json({
      id: formId,
      message: "Form submitted successfully"
    });
    
  } catch (error) {
    logger.error('خطأ في حفظ النموذج:', error);
    res.status(500).json({ error: error.message });
  }
});

const fileValidator = new FileValidator(config);

// Upload photos endpoint
app.post('/api/forms/:id/photos', upload.array('photos', 8), async (req, res) => {
  const formId = req.params.id;
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "لم يتم رفع أي ملفات" });
  }

  try {
    // التحقق من كل ملف
    const validationPromises = files.map(async file => {
      try {
        const validationResults = await fileValidator.validateFile(file);
        return {
          file,
          isValid: true,
          results: validationResults
        };
      } catch (error) {
        return {
          file,
          isValid: false,
          error: error.message
        };
      }
    });

    const validationResults = await Promise.all(validationPromises);
    const invalidFiles = validationResults.filter(result => !result.isValid);

    // إذا كان هناك ملفات غير صالحة، قم بحذفها وإرجاع خطأ
    if (invalidFiles.length > 0) {
      // حذف الملفات غير الصالحة
      invalidFiles.forEach(result => {
        try {
          fs.unlinkSync(result.file.path);
        } catch (error) {
          logger.error('خطأ في حذف الملف غير الصالح:', error);
        }
      });

      return res.status(400).json({
        error: "بعض الملفات غير صالحة",
        details: invalidFiles.map(result => ({
          fileName: result.file.originalname,
          error: result.error
        }))
      });
    }

    // حفظ الملفات الصالحة في قاعدة البيانات
    const insertPromises = validationResults.map(result => {
      const secureFilePath = fileValidator.createSecurePath(
        result.file.originalname,
        config.upload.path
      );

      // نقل الملف إلى المسار الآمن
      fs.renameSync(result.file.path, secureFilePath);

      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO photos (form_id, file_path, hash, metadata) 
           VALUES (?, ?, ?, ?)`,
          [
            formId,
            secureFilePath,
            result.results.hash,
            JSON.stringify({
              originalName: result.file.originalname,
              mimeType: result.file.mimetype,
              size: result.file.size,
              validationResults: result.results
            })
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    });

    const photoIds = await Promise.all(insertPromises);

    res.json({
      message: `تم رفع ${files.length} صور بنجاح`,
      photoIds: photoIds
    });
  } catch (error) {
    // في حالة حدوث خطأ، حذف جميع الملفات المرفوعة
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        logger.error('خطأ في حذف الملف بعد فشل المعالجة:', err);
      }
    });

    logger.error('خطأ في معالجة الملفات المرفوعة:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete form
app.delete('/api/forms/:id', (req, res) => {
  const formId = req.params.id;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Delete related records from all tables
    db.run(`DELETE FROM photos WHERE form_id = ?`, [formId], err => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      
      db.run(`DELETE FROM officers WHERE form_id = ?`, [formId], err => {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        db.run(`DELETE FROM inspectors WHERE form_id = ?`, [formId], err => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          db.run(`DELETE FROM inspection_results WHERE form_id = ?`, [formId], err => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            
            db.run(`DELETE FROM observations WHERE form_id = ?`, [formId], err => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
              
              db.run(`DELETE FROM requirements WHERE form_id = ?`, [formId], err => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                
                db.run(`DELETE FROM addresses WHERE form_id = ?`, [formId], err => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                  }
                  
                  db.run(`DELETE FROM forms WHERE id = ?`, [formId], err => {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: err.message });
                    }
                    
                    db.run('COMMIT');
                    res.json({ message: `Form with ID ${formId} deleted successfully` });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// Set up authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Set up forms routes
const formsRoutes = require('./routes/forms');
app.use('/api/forms', formsRoutes);

// Handle errors
app.use((err, req, res, next) => {
  logger.error('خطأ غير معالج:', err);
  res.status(500).json({
    error: 'حدث خطأ في الخادم',
    message: config.app.env === 'development' ? err.message : 'خطأ داخلي'
  });
});

// Start server
app.listen(port, () => {
  logger.info(`الخادم يعمل على المنفذ ${port}`);
});

// Close database connection when app terminates
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      logger.error('خطأ في إغلاق قاعدة البيانات:', err.message);
    } else {
      logger.info('تم إغلاق الاتصال بقاعدة البيانات');
    }
    process.exit(0);
  });
});

// Add endpoint for updating custom requirements order
app.put('/api/forms/:id/custom-requirements/reorder', (req, res) => {
  const formId = req.params.id;
  const { requirements } = req.body;
  
  if (!Array.isArray(requirements)) {
    return res.status(400).json({ error: "Invalid requirements data" });
  }
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    const updateStmt = db.prepare(`UPDATE custom_requirements SET order_index = ? WHERE form_id = ? AND requirement = ?`);
    requirements.forEach((req, index) => {
      updateStmt.run([index, formId, req]);
    });
    updateStmt.finalize();
    
    db.run('COMMIT');
    res.json({ message: "Requirements order updated successfully" });
  });
});