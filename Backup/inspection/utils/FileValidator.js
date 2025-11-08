const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class FileValidator {
  constructor(config) {
    this.config = config;
  }

  async validateFile(file) {
    // التحقق من نوع الملف
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.config.upload.allowedTypes.includes(ext)) {
      throw new Error('نوع الملف غير مدعوم');
    }

    // التحقق من حجم الملف
    if (file.size > this.config.upload.maxSize) {
      throw new Error('حجم الملف أكبر من الحد المسموح به');
    }

    // حساب البصمة الرقمية للملف
    const hash = await this.calculateHash(file.path);

    // معالجة الصور
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      await this.processImage(file.path);
    }

    return {
      hash,
      size: file.size,
      type: ext
    };
  }

  async calculateHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('error', err => reject(err));
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  async processImage(filePath) {
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // تحسين جودة الصورة إذا كانت كبيرة جداً
      if (metadata.width > 2000 || metadata.height > 2000) {
        await image
          .resize(2000, 2000, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toBuffer()
          .then(buffer => fs.writeFileSync(filePath, buffer));
      }

      return metadata;
    } catch (error) {
      throw new Error('فشل في معالجة الصورة: ' + error.message);
    }
  }

  createSecurePath(originalName, uploadPath) {
    const ext = path.extname(originalName);
    const uniqueName = crypto.randomBytes(16).toString('hex') + ext;
    return path.join(uploadPath, uniqueName);
  }
}

module.exports = FileValidator; 