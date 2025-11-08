const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;
const app = require('../../server');
const config = require('../../config');

describe('API Integration Tests', () => {
  let testFormId;
  let testPhotoId;
  let csrfToken;

  // إعداد قبل كل اختبار
  beforeEach(async () => {
    // الحصول على رمز CSRF
    const response = await request(app)
      .get('/api/csrf-token');
    csrfToken = response.body.csrfToken;
  });

  describe('Form Management', () => {
    it('should create a draft form', async () => {
      const formData = {
        file_no: 'TEST-001',
        reference_no: 'REF-001',
        occupancy_name: 'Test Building',
        facility_nature: 'Commercial',
        service_type: 'New',
        preview_date: '2024-03-20'
      };

      const response = await request(app)
        .post('/api/forms/draft')
        .set('CSRF-Token', csrfToken)
        .send(formData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('Draft form created successfully');

      testFormId = response.body.id;
    });

    it('should get all forms', async () => {
      const response = await request(app)
        .get('/api/forms');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a single form by ID', async () => {
      const response = await request(app)
        .get(`/api/forms/${testFormId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testFormId);
      expect(response.body).toHaveProperty('occupancy_name', 'Test Building');
    });

    it('should submit a complete form', async () => {
      const completeForm = {
        form: {
          id: testFormId,
          file_no: 'TEST-001',
          reference_no: 'REF-001',
          occupancy_name: 'Test Building Updated',
          facility_nature: 'Commercial',
          service_type: 'New',
          preview_date: '2024-03-20'
        },
        address: {
          shop_flat: 'Test Shop',
          building: 'Test Building',
          road: 'Test Road',
          block: 'Test Block',
          area: 'Test Area'
        },
        requirements: {
          req1: true,
          req2: false,
          req3: true
        },
        customRequirements: [
          'Custom Requirement 1',
          'Custom Requirement 2'
        ],
        results: {
          is_compliant: true,
          correction_days: 0
        }
      };

      const response = await request(app)
        .post('/api/forms/submit')
        .set('CSRF-Token', csrfToken)
        .send(completeForm);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('Form submitted successfully');
    });
  });

  describe('Photo Management', () => {
    it('should upload photos to a form', async () => {
      // إنشاء ملف اختبار مؤقت
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      await fs.writeFile(testImagePath, 'test image data');

      const response = await request(app)
        .post(`/api/forms/${testFormId}/photos`)
        .set('CSRF-Token', csrfToken)
        .attach('photos', testImagePath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('photoIds');
      expect(Array.isArray(response.body.photoIds)).toBe(true);

      testPhotoId = response.body.photoIds[0];

      // تنظيف ملف الاختبار
      await fs.unlink(testImagePath);
    });

    it('should reject invalid file types', async () => {
      // إنشاء ملف اختبار غير صالح
      const testFilePath = path.join(__dirname, 'test.txt');
      await fs.writeFile(testFilePath, 'invalid file');

      const response = await request(app)
        .post(`/api/forms/${testFormId}/photos`)
        .set('CSRF-Token', csrfToken)
        .attach('photos', testFilePath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      // تنظيف ملف الاختبار
      await fs.unlink(testFilePath);
    });
  });

  describe('Form Deletion', () => {
    it('should delete a form and its associated data', async () => {
      const response = await request(app)
        .delete(`/api/forms/${testFormId}`)
        .set('CSRF-Token', csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');

      // التحقق من أن النموذج لم يعد موجوداً
      const getResponse = await request(app)
        .get(`/api/forms/${testFormId}`);
      expect(getResponse.status).toBe(404);
    });
  });
}); 