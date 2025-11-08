import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { useCache } from '../../hooks/useCache';
import { debounce } from 'lodash';

// مكون تحسين أداء النماذج
export function FormPerformanceOptimizer({ formId, children }) {
  const formRef = useRef(null);
  const eventsAttachedRef = useRef(false);
  
  // استخدام نظام التخزين المؤقت للنموذج
  const { data: formData, loading, error, refetch, invalidate } = useCache(
    `form-${formId}`,
    async () => {
      if (!formId) return null;
      const response = await fetch(`/api/forms/${formId}`);
      if (!response.ok) throw new Error('فشل تحميل النموذج');
      return response.json();
    },
    {
      enabled: !!formId,
      prefetch: true,
      prefetchPriority: 'high',
      retryCount: 3,
      onError: (error) => console.error('خطأ في تحميل النموذج:', error)
    }
  );

  // Create stable field validation function
  const validateField = useCallback((field) => {
    if (!field || !field.validity) return;
    
    // Apply validation logic based on field type
    if (field.validity.valid) {
      field.classList.remove('invalid');
      const errorElement = field.parentNode.querySelector('.field-error');
      if (errorElement) errorElement.remove();
    } else {
      field.classList.add('invalid');
    }
  }, []);

  // تحسين الأداء عند إدخال البيانات - make stable with useMemo
  const optimizeInputPerformance = useCallback(() => {
    if (!formRef.current || eventsAttachedRef.current) return;
    
    // Set flag to prevent attaching events multiple times
    eventsAttachedRef.current = true;

    // تطبيق تأخير على التحقق من صحة الحقول
    const inputs = formRef.current.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Create a per-input debounced handler
      const debouncedValidation = debounce(() => {
        validateField(input);
      }, 300);

      // Store original handler reference on the element
      input._validationHandler = debouncedValidation;
      
      input.addEventListener('input', debouncedValidation);
    });
  }, [validateField]);

  // تحسين إرسال النموذج - make stable with useMemo
  const optimizeFormSubmission = useCallback(() => {
    if (!formRef.current || !formRef.current.querySelector('form')) return;
    
    const form = formRef.current.querySelector('form');
    
    // Prevent default submit handler for controlled forms
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Submit optimization logic
    });
  }, []);

  // تحسين تحميل الصور - make stable with useMemo
  const optimizeImageLoading = useCallback(() => {
    if (!formRef.current) return;
    
    // تأجيل تحميل الصور غير المرئية
    const images = formRef.current.querySelectorAll('img');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              imageObserver.unobserve(img);
            }
          }
        });
      });
      
      images.forEach(image => {
        if (image.src && !image.dataset.src) {
          image.dataset.src = image.src;
          image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
          imageObserver.observe(image);
        }
      });
    }
  }, []);

  // تطبيق التحسينات عند تحميل المكون - combine effects
  useEffect(() => {
    // Only run these optimizations once
    if (!eventsAttachedRef.current) {
      optimizeInputPerformance();
      optimizeFormSubmission();
      optimizeImageLoading();
    }

    // تنظيف المراقبين والمستمعين عند إزالة المكون
    return () => {
      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (input._validationHandler) {
            input.removeEventListener('input', input._validationHandler);
            delete input._validationHandler;
          }
        });
        eventsAttachedRef.current = false;
      }
    };
  }, [optimizeInputPerformance, optimizeFormSubmission, optimizeImageLoading]);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ: {error.message}</div>;

  return (
    <div ref={formRef}>
      {children}
    </div>
  );
} 