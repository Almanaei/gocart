const FileValidator = require('../../utils/FileValidator');
const path = require('path');
const fs = require('fs').promises;

describe('FileValidator', () => {
  let fileValidator;
  const config = {
    upload: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      path: './uploads'
    }
  };

  beforeEach(() => {
    fileValidator = new FileValidator(config);
  });

  describe('validateFileType', () => {
    it('should accept allowed file types', async () => {
      const file = {
        mimetype: 'image/jpeg',
        originalname: 'test.jpg'
      };

      const result = await fileValidator.validateFileType(file);
      expect(result).toBe(true);
    });

    it('should reject disallowed file types', async () => {
      const file = {
        mimetype: 'application/javascript',
        originalname: 'test.js'
      };

      await expect(fileValidator.validateFileType(file))
        .rejects.toThrow('نوع الملف غير مدعوم');
    });

    it('should detect file type spoofing', async () => {
      const file = {
        mimetype: 'image/jpeg',
        originalname: 'malicious.exe.jpg'
      };

      await expect(fileValidator.validateFileType(file))
        .rejects.toThrow('امتداد الملف غير آمن');
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', async () => {
      const file = {
        size: 1024 * 1024 // 1MB
      };

      const result = await fileValidator.validateFileSize(file);
      expect(result).toBe(true);
    });

    it('should reject files exceeding size limit', async () => {
      const file = {
        size: 10 * 1024 * 1024 // 10MB
      };

      await expect(fileValidator.validateFileSize(file))
        .rejects.toThrow('حجم الملف يتجاوز الحد المسموح به');
    });
  });

  describe('validateImage', () => {
    it('should validate image dimensions', async () => {
      const file = {
        path: 'test/fixtures/valid-image.jpg',
        mimetype: 'image/jpeg'
      };

      const result = await fileValidator.validateImage(file);
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
    });

    it('should reject corrupted images', async () => {
      const file = {
        path: 'test/fixtures/corrupted-image.jpg',
        mimetype: 'image/jpeg'
      };

      await expect(fileValidator.validateImage(file))
        .rejects.toThrow('الصورة تالفة أو غير صالحة');
    });
  });

  describe('calculateFileHash', () => {
    it('should generate consistent hashes for same file', async () => {
      const file = {
        path: 'test/fixtures/test-file.txt'
      };

      const hash1 = await fileValidator.calculateFileHash(file);
      const hash2 = await fileValidator.calculateFileHash(file);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different files', async () => {
      const file1 = {
        path: 'test/fixtures/test-file1.txt'
      };
      const file2 = {
        path: 'test/fixtures/test-file2.txt'
      };

      const hash1 = await fileValidator.calculateFileHash(file1);
      const hash2 = await fileValidator.calculateFileHash(file2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createSecurePath', () => {
    it('should create safe file paths', () => {
      const filename = 'test../../../malicious.jpg';
      const uploadPath = './uploads';

      const securePath = fileValidator.createSecurePath(filename, uploadPath);

      expect(securePath).not.toContain('..');
      expect(path.isAbsolute(securePath)).toBe(false);
      expect(securePath.startsWith(uploadPath)).toBe(true);
    });

    it('should handle special characters in filenames', () => {
      const filename = 'test$#@!file.jpg';
      const uploadPath = './uploads';

      const securePath = fileValidator.createSecurePath(filename, uploadPath);

      expect(securePath).toMatch(/^[a-zA-Z0-9\-_\.\/]+$/);
    });
  });

  describe('validateFile', () => {
    it('should perform all validations for valid file', async () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        path: 'test/fixtures/valid-image.jpg',
        originalname: 'test.jpg'
      };

      const result = await fileValidator.validateFile(file);

      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('dimensions');
      expect(result.isValid).toBe(true);
    });

    it('should reject file failing any validation', async () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // Too large
        path: 'test/fixtures/valid-image.jpg',
        originalname: 'test.jpg'
      };

      await expect(fileValidator.validateFile(file))
        .rejects.toThrow();
    });
  });
}); 