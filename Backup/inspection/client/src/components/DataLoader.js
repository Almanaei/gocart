import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// مدير الذاكرة المؤقتة للبيانات
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

const DataLoader = ({
  url,
  params = {},
  dependencies = [],
  loadingComponent,
  errorComponent,
  onDataLoaded,
  children,
  cacheKey,
  retryCount = 3,
  retryDelay = 1000,
  timeout = 30000,
  showLoadingIndicator = true,
  showErrorMessages = true
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // التحقق من صلاحية البيانات المخزنة مؤقتاً
  const isValidCache = useCallback((cachedData) => {
    if (!cachedData) return false;
    const now = Date.now();
    return (now - cachedData.timestamp) < CACHE_DURATION;
  }, []);

  // تحميل البيانات مع إدارة الذاكرة المؤقتة والمحاولات
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // التحقق من وجود بيانات مخزنة مؤقتاً
      if (cacheKey) {
        const cachedData = cache.get(cacheKey);
        if (isValidCache(cachedData)) {
          setData(cachedData.data);
          setLoading(false);
          if (onDataLoaded) onDataLoaded(cachedData.data);
          return;
        }
      }

      // إعداد مهلة الطلب
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // إرسال الطلب
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // يمكن إضافة headers أخرى هنا
        },
        signal: controller.signal,
        ...params
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // تخزين البيانات في الذاكرة المؤقتة
      if (cacheKey) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setData(result);
      if (onDataLoaded) onDataLoaded(result);
    } catch (err) {
      console.error('Error loading data:', err);

      // إعادة المحاولة في حالة الفشل
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        setTimeout(() => loadData(), retryDelay * (retries + 1));
      } else {
        setError(err.message);
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }, [url, params, cacheKey, retries, retryCount, retryDelay, timeout, onDataLoaded]);

  // تحميل البيانات عند تغيير المعتمدات
  useEffect(() => {
    loadData();
  }, [...dependencies, loadData]);

  // تنظيف الذاكرة المؤقتة دورياً
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }, CACHE_DURATION);

    return () => clearInterval(cleanup);
  }, []);

  // عرض مؤشر التحميل
  if (loading && showLoadingIndicator) {
    return loadingComponent || (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2 }}
        >
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  // عرض رسالة الخطأ
  if (error && showErrorMessages) {
    return errorComponent || (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('common.error')}: {error}
        </Alert>
        {children && children(null)}
      </>
    );
  }

  // عرض رسالة الخطأ في Snackbar
  return (
    <>
      {children && children(data)}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DataLoader; 