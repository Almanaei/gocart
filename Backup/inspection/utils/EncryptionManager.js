const crypto = require('crypto');

class EncryptionManager {
  constructor() {
    // استخدام مفتاح بطول 32 بايت (256 بت) للتشفير AES-256-GCM
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-encryption-key', 'salt', 32);
  }

  async encryptFields(data, fields) {
    const encryptedData = { ...data };
    
    for (const field of fields) {
      if (data[field]) {
        encryptedData[field] = await this.encrypt(data[field]);
      }
    }
    
    return encryptedData;
  }

  async decryptFields(data, fields) {
    const decryptedData = { ...data };
    
    for (const field of fields) {
      if (data[field]) {
        try {
          decryptedData[field] = await this.decrypt(data[field]);
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
          decryptedData[field] = data[field]; // الاحتفاظ بالقيمة المشفرة في حالة فشل فك التشفير
        }
      }
    }
    
    return decryptedData;
  }

  async encrypt(text) {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // دمج IV والـ auth tag مع النص المشفر
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('فشل في تشفير البيانات: ' + error.message);
    }
  }

  async decrypt(encryptedText) {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('فشل في فك تشفير البيانات: ' + error.message);
    }
  }
}

module.exports = EncryptionManager; 