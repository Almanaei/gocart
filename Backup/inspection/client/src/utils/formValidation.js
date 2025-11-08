import { isValidPhoneNumber } from 'libphonenumber-js';

// التحقق من صحة رقم الملف
export const validateFileNo = (fileNo) => {
  if (!fileNo) return null;
  const fileNoPattern = /^[A-Z]{2}-\d{4}-\d{4}$/;
  return fileNoPattern.test(fileNo);
};

// التحقق من صحة الرقم المرجعي
export const validateReferenceNo = (referenceNo) => {
  if (!referenceNo) return null;
  const refNoPattern = /^REF-\d{6}$/;
  return refNoPattern.test(referenceNo);
};

// التحقق من صحة اسم المنشأة
export const validateOccupancyName = (name) => {
  return name && name.length >= 3 && name.length <= 100;
};

// التحقق من صحة طبيعة المنشأة
export const validateFacilityNature = (nature) => {
  const validNatures = [
    'تجاري',
    'صناعي',
    'سكني',
    'حكومي',
    'تعليمي',
    'صحي',
    'ترفيهي',
    'أخرى'
  ];
  return validNatures.includes(nature);
};

// التحقق من صحة نوع الخدمة
export const validateServiceType = (type) => {
  const validTypes = [
    'جديد',
    'تجديد',
    'شكوى',
    'متابعة'
  ];
  return validTypes.includes(type);
};

// التحقق من صحة التاريخ
export const validateDate = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  return selectedDate <= today;
};

// التحقق من صحة العنوان
export const validateAddress = (address) => {
  const errors = {};

  // التحقق من رقم المحل/الشقة
  if (address.shop_flat && !/^\d+[A-Za-z]?$/.test(address.shop_flat)) {
    errors.shop_flat = 'رقم المحل/الشقة غير صالح';
  }

  // التحقق من رقم المبنى
  if (address.building && !/^\d+[A-Za-z]?$/.test(address.building)) {
    errors.building = 'رقم المبنى غير صالح';
  }

  // التحقق من رقم الطريق
  if (!address.road || !/^\d+$/.test(address.road)) {
    errors.road = 'رقم الطريق مطلوب ويجب أن يكون رقماً';
  }

  // التحقق من رقم المجمع
  if (!address.block || !/^\d{3,4}$/.test(address.block)) {
    errors.block = 'رقم المجمع مطلوب ويجب أن يكون 3-4 أرقام';
  }

  // التحقق من المنطقة
  if (!address.area) {
    errors.area = 'المنطقة مطلوبة';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// التحقق من صحة المتطلبات
export const validateRequirements = (requirements) => {
  // التأكد من أن جميع المتطلبات تم تحديدها
  const unCheckedRequirements = Object.entries(requirements)
    .filter(([key, value]) => key.startsWith('req') && typeof value !== 'boolean');

  return {
    isValid: unCheckedRequirements.length === 0,
    errors: unCheckedRequirements.length > 0 ? {
      general: 'يجب تحديد جميع المتطلبات'
    } : {}
  };
};

// التحقق من صحة الملاحظات
export const validateObservations = (observations) => {
  const errors = {};
  let hasValue = false;

  Object.entries(observations).forEach(([key, value]) => {
    if (value) {
      hasValue = true;
      if (value.length > 500) {
        errors[key] = 'الملاحظة لا يجب أن تتجاوز 500 حرف';
      }
    }
  });

  // يجب إضافة ملاحظة واحدة على الأقل إذا كانت المنشأة غير مستوفية
  return {
    isValid: Object.keys(errors).length === 0 && hasValue,
    errors,
    hasValue
  };
};

// التحقق من صحة نتائج التفتيش
export const validateResults = (results) => {
  const errors = {};

  if (typeof results.is_compliant !== 'boolean') {
    errors.is_compliant = 'يجب تحديد نتيجة التفتيش';
  }

  if (!results.is_compliant) {
    if (!results.correction_days || results.correction_days < 1 || results.correction_days > 90) {
      errors.correction_days = 'يجب تحديد مدة التصحيح (1-90 يوم)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// التحقق من صحة معلومات المفتش
export const validateInspector = (inspector) => {
  const errors = {};

  if (!inspector.name || inspector.name.length < 3) {
    errors.name = 'اسم المفتش مطلوب ويجب أن يكون 3 أحرف على الأقل';
  }

  if (!inspector.signature_path) {
    errors.signature = 'توقيع المفتش مطلوب';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// التحقق من صحة الصور
export const validatePhotos = (photos) => {
  const errors = {};

  if (photos.length > 8) {
    errors.count = 'الحد الأقصى للصور هو 8 صور';
  }

  photos.forEach((photo, index) => {
    if (photo.size > 5 * 1024 * 1024) { // 5MB
      errors[`photo_${index}`] = 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت';
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(photo.type)) {
      errors[`photo_${index}`] = 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, JPEG, PNG';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// التحقق من صحة النموذج بالكامل
export const validateForm = (formData) => {
  const validations = {
    establishment: {
      isValid: validateOccupancyName(formData.form.occupancy_name) &&
               validateFileNo(formData.form.file_no) &&
               validateReferenceNo(formData.form.reference_no) &&
               validateFacilityNature(formData.form.facility_nature) &&
               validateServiceType(formData.form.service_type) &&
               validateDate(formData.form.preview_date),
      step: 0
    },
    address: {
      ...validateAddress(formData.address),
      step: 1
    },
    requirements: {
      ...validateRequirements(formData.requirements),
      step: 2
    },
    observations: {
      ...validateObservations(formData.observations),
      step: 3
    },
    results: {
      ...validateResults(formData.results),
      step: 4
    },
    inspector: {
      ...validateInspector(formData.inspector),
      step: 5
    },
    photos: {
      ...validatePhotos(formData.photos),
      step: 6
    }
  };

  const firstInvalidStep = Object.values(validations)
    .find(validation => !validation.isValid);

  return {
    isValid: !firstInvalidStep,
    firstInvalidStep: firstInvalidStep?.step,
    validations
  };
};

// Export the isValidPhoneNumber function so it can be used
export { isValidPhoneNumber }; 