# نظام إدارة التفتيش

نظام متكامل لإدارة عمليات التفتيش على المنشآت، مبني باستخدام Node.js وExpress وSQLite.

## المميزات

- إدارة المستخدمين والصلاحيات
- إدارة المنشآت والمواقع
- جدولة وتنفيذ عمليات التفتيش
- إدارة المرفقات والصور
- إنشاء التقارير وتصديرها
- النسخ الاحتياطي التلقائي
- تشفير البيانات الحساسة
- تسجيل العمليات والأحداث

## المتطلبات

- Node.js (v18 أو أحدث)
- npm (v9 أو أحدث)
- SQLite3

## التثبيت

1. استنساخ المستودع:
   ```bash
   git clone https://github.com/yourusername/inspection-system.git
   cd inspection-system
   ```

2. تثبيت التبعيات:
   ```bash
   npm install
   ```

3. نسخ ملف البيئة:
   ```bash
   cp .env.example .env
   ```

4. تعديل ملف `.env` حسب الإعدادات المطلوبة.

5. إنشاء المجلدات المطلوبة:
   ```bash
   mkdir -p data uploads logs backups
   ```

## التشغيل

- وضع التطوير:
  ```bash
  npm run dev
  ```

- وضع الإنتاج:
  ```bash
  npm start
  ```

## الاختبارات

```bash
npm test
```

## فحص جودة الكود

```bash
npm run lint
```

## النسخ الاحتياطي

```bash
npm run backup
```

## الهيكل

```
.
├── config/             # ملفات الإعدادات
├── controllers/        # وحدات التحكم
├── data/              # قاعدة البيانات
├── docs/              # الوثائق
├── logs/              # السجلات
├── middlewares/       # الوسائط
├── models/            # النماذج
├── routes/            # المسارات
├── services/          # الخدمات
├── uploads/           # المرفقات
└── utils/             # الأدوات المساعدة
```

## المساهمة

1. انشئ فرعاً جديداً (`git checkout -b feature/amazing-feature`)
2. قم بعمل التغييرات المطلوبة
3. أضف التغييرات (`git add .`)
4. قم بعمل commit (`git commit -m 'إضافة ميزة رائعة'`)
5. ارفع التغييرات (`git push origin feature/amazing-feature`)
6. افتح طلب دمج

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشكلة أو لديك اقتراح، يرجى فتح issue في المستودع. 