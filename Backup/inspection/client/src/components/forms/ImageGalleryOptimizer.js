import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  IconButton,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../store/AppStateManager';

const ImageGalleryOptimizer = ({ formId, images, onDelete }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { state } = useAppState();
  
  const [loadedImages, setLoadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef(null);
  const imageCache = useRef(new Map());

  // تهيئة مراقب تقاطع العناصر للتحميل البطيء
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              loadImage(src).then(() => {
                img.src = src;
                img.removeAttribute('data-src');
              });
            }
            observer.current.unobserve(img);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // تحميل الصور مع التحسين
  const loadImage = useCallback(async (src) => {
    if (imageCache.current.has(src)) {
      return imageCache.current.get(src);
    }

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      
      // تحسين حجم الصورة إذا كان مطلوباً
      let optimizedBlob = blob;
      if (state.settings.performance.compressionQuality < 1) {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let { width, height } = img;
        const maxWidth = state.settings.performance.maxImageWidth;
        const maxHeight = state.settings.performance.maxImageHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const quality = state.settings.performance.compressionQuality;
        optimizedBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', quality)
        );
      }

      const objectUrl = URL.createObjectURL(optimizedBlob);
      imageCache.current.set(src, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error('خطأ في تحميل الصورة:', err);
      throw err;
    }
  }, [state.settings.performance]);

  // تحميل الصور عند تغيير القائمة
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);

      try {
        const optimizedImages = await Promise.all(
          images.map(async (image) => {
            try {
              const optimizedUrl = await loadImage(image.file_path);
              return { ...image, optimizedUrl };
            } catch (err) {
              console.error(`خطأ في تحميل الصورة ${image.id}:`, err);
              return { ...image, error: true };
            }
          })
        );

        setLoadedImages(optimizedImages);
      } catch (err) {
        setError(t('errors.imageLoad'));
      } finally {
        setLoading(false);
      }
    };

    if (images && images.length > 0) {
      loadImages();
    } else {
      setLoadedImages([]);
      setLoading(false);
    }
  }, [images, loadImage, t]);

  // تنظيف عناوين URL للصور عند إزالة المكون
  useEffect(() => {
    return () => {
      imageCache.current.forEach((url) => URL.revokeObjectURL(url));
      imageCache.current.clear();
    };
  }, []);

  // معالجة حذف الصورة
  const handleDelete = async (imageId) => {
    try {
      await onDelete(imageId);
      setLoadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('خطأ في حذف الصورة:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <ImageList
        cols={isMobile ? 2 : 4}
        gap={8}
        sx={{
          mb: 2,
          '& .MuiImageListItem-root': {
            overflow: 'hidden',
            borderRadius: 1
          }
        }}
      >
        {loadedImages.map((image) => (
          <ImageListItem key={image.id}>
            <img
              src={image.optimizedUrl}
              alt={t('images.photo')}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedImage(image)}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                p: 0.5,
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '0 0 0 4px'
              }}
            >
              <Tooltip title={t('common.delete')}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  sx={{ color: 'white' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('common.zoom')}>
                <IconButton
                  size="small"
                  onClick={() => setSelectedImage(image)}
                  sx={{ color: 'white' }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedImage && (
            <img
              src={selectedImage.optimizedUrl}
              alt={t('images.photo')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageGalleryOptimizer; 