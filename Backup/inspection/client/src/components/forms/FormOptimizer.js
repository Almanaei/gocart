import React, { useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../../store/AppStateManager';
import { debounce } from 'lodash';

const FormOptimizer = ({ children, formId }) => {
  const { state, updateFormData } = useAppState();
  const formRef = useRef(null);
  const unsavedChanges = useRef(false);

  // التحقق من التغييرات غير المحفوظة قبل مغادرة الصفحة
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // الحفظ التلقائي للنموذج
  const autoSave = useCallback(
    debounce(async (data) => {
      try {
        await updateFormData(formId, data);
        unsavedChanges.current = false;
      } catch (error) {
        console.error('خطأ في الحفظ التلقائي:', error);
      }
    }, state.settings.form.autosaveInterval),
    [formId, updateFormData]
  );

  // تتبع التغييرات في النموذج
  const handleFormChange = useCallback((event) => {
    if (!state.settings.form.autoSave) return;
    
    unsavedChanges.current = true;
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());
    autoSave(data);
  }, [autoSave, state.settings.form.autoSave]);

  // التحقق التلقائي من صحة المدخلات
  const validateField = useCallback((field) => {
    if (!state.settings.form.autoValidate) return true;

    const validations = {
      occupancy_name: (value) => {
        if (!value) return 'validation.occupancyName.required';
        if (value.length < 3) return 'validation.occupancyName.minLength';
        if (value.length > 100) return 'validation.occupancyName.maxLength';
        return '';
      },
      file_no: (value) => {
        if (value && !/^[A-Z]{2}-\d{4}-\d{4}$/.test(value)) {
          return 'validation.fileNo.pattern';
        }
        return '';
      },
      reference_no: (value) => {
        if (value && !/^REF-\d{6}$/.test(value)) {
          return 'validation.referenceNo.pattern';
        }
        return '';
      },
      preview_date: (value) => {
        if (!value) return 'validation.previewDate.required';
        const date = new Date(value);
        if (date > new Date()) return 'validation.previewDate.invalid';
        return '';
      }
    };

    const validation = validations[field.name];
    if (!validation) return true;

    const error = validation(field.value);
    field.setCustomValidity(error ? error : '');
    
    if (error && state.settings.form.showValidationHints) {
      const errorElement = document.createElement('div');
      errorElement.className = 'validation-hint';
      errorElement.textContent = error;
      field.parentNode.appendChild(errorElement);
    }

    return !error;
  }, [state.settings.form]);

  // تحسين أداء النموذج
  useEffect(() => {
    if (!formRef.current) return;

    // تحسين التحقق من المدخلات
    const fields = formRef.current.elements;
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (!field.name) continue;

      // التحقق عند مغادرة الحقل
      if (state.settings.form.validateOnBlur) {
        field.addEventListener('blur', () => validateField(field));
      }

      // تحسين الأداء عند الكتابة
      field.addEventListener('input', debounce(() => {
        validateField(field);
      }, 300));
    }

    // تنظيف المؤشرات عند إعادة التحميل
    return () => {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (!field.name) continue;
        
        if (state.settings.form.validateOnBlur) {
          field.removeEventListener('blur', () => validateField(field));
        }
        field.removeEventListener('input', () => validateField(field));
      }
    };
  }, [validateField, state.settings.form]);

  return (
    <form
      ref={formRef}
      onChange={handleFormChange}
      noValidate={!state.settings.form.autoValidate}
    >
      {children}
    </form>
  );
};

export default FormOptimizer; 