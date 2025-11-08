const EncryptionManager = require('../../utils/EncryptionManager');

describe('EncryptionManager', () => {
  let encryptionManager;

  beforeEach(() => {
    encryptionManager = new EncryptionManager();
  });

  describe('encryptFields', () => {
    it('should encrypt sensitive fields correctly', async () => {
      const testData = {
        file_no: 'F123',
        reference_no: 'R456',
        occupancy_name: 'Test Building'
      };
      const sensitiveFields = ['file_no', 'reference_no', 'occupancy_name'];

      const encryptedData = await encryptionManager.encryptFields(testData, sensitiveFields);

      // التحقق من أن البيانات تم تشفيرها
      expect(encryptedData.file_no).not.toBe(testData.file_no);
      expect(encryptedData.reference_no).not.toBe(testData.reference_no);
      expect(encryptedData.occupancy_name).not.toBe(testData.occupancy_name);

      // التحقق من أن البيانات المشفرة هي نصوص
      expect(typeof encryptedData.file_no).toBe('string');
      expect(typeof encryptedData.reference_no).toBe('string');
      expect(typeof encryptedData.occupancy_name).toBe('string');
    });

    it('should not encrypt non-sensitive fields', async () => {
      const testData = {
        file_no: 'F123',
        status: 'draft'
      };
      const sensitiveFields = ['file_no'];

      const encryptedData = await encryptionManager.encryptFields(testData, sensitiveFields);

      expect(encryptedData.file_no).not.toBe(testData.file_no);
      expect(encryptedData.status).toBe(testData.status);
    });

    it('should handle empty data gracefully', async () => {
      const testData = {};
      const sensitiveFields = ['file_no'];

      const encryptedData = await encryptionManager.encryptFields(testData, sensitiveFields);

      expect(encryptedData).toEqual({});
    });
  });

  describe('decryptFields', () => {
    it('should decrypt encrypted fields correctly', async () => {
      const testData = {
        file_no: 'F123',
        reference_no: 'R456'
      };
      const sensitiveFields = ['file_no', 'reference_no'];

      const encryptedData = await encryptionManager.encryptFields(testData, sensitiveFields);
      const decryptedData = await encryptionManager.decryptFields(encryptedData, sensitiveFields);

      expect(decryptedData.file_no).toBe(testData.file_no);
      expect(decryptedData.reference_no).toBe(testData.reference_no);
    });

    it('should handle missing fields gracefully', async () => {
      const testData = {
        file_no: 'F123'
      };
      const sensitiveFields = ['file_no', 'reference_no'];

      const encryptedData = await encryptionManager.encryptFields(testData, sensitiveFields);
      const decryptedData = await encryptionManager.decryptFields(encryptedData, sensitiveFields);

      expect(decryptedData.file_no).toBe(testData.file_no);
      expect(decryptedData.reference_no).toBeUndefined();
    });

    it('should handle invalid encrypted data', async () => {
      const invalidData = {
        file_no: 'invalid_encrypted_data'
      };
      const sensitiveFields = ['file_no'];

      await expect(encryptionManager.decryptFields(invalidData, sensitiveFields))
        .rejects.toThrow();
    });
  });

  describe('key management', () => {
    it('should use different IVs for same data', async () => {
      const testData = {
        file_no: 'F123'
      };
      const sensitiveFields = ['file_no'];

      const encrypted1 = await encryptionManager.encryptFields(testData, sensitiveFields);
      const encrypted2 = await encryptionManager.encryptFields(testData, sensitiveFields);

      expect(encrypted1.file_no).not.toBe(encrypted2.file_no);
    });

    it('should handle key rotation', async () => {
      const testData = {
        file_no: 'F123'
      };
      const sensitiveFields = ['file_no'];

      const encrypted = await encryptionManager.encryptFields(testData, sensitiveFields);
      
      // محاكاة تدوير المفتاح
      await encryptionManager.rotateKey();
      
      const decrypted = await encryptionManager.decryptFields(encrypted, sensitiveFields);
      expect(decrypted.file_no).toBe(testData.file_no);
    });
  });
}); 