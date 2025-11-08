import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import CropIcon from '@mui/icons-material/Crop';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageUploader = ({ 
  maxFiles = 8,
  maxSize = 5 * 1024 * 1024, // 5MB
  onUpload,
  onDelete,
  existingImages = [],
  error
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [settings, setSettings] = useState({
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    preserveExif: true,
    autoCompress: true
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 100, height: 100 });
  const imageRef = useRef(null);

  // معالجة إسقاط الصور
  const onDrop = useCallback(async (acceptedFiles) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      return;
    }

    // Define compression options inside the callback
    const compressionOptions = {
      maxSizeMB: maxSize / (1024 * 1024),
      maxWidthOrHeight: Math.max(settings.maxWidth, settings.maxHeight),
      useWebWorker: true,
      preserveExif: settings.preserveExif
    };

    setUploading(true);
    const newFiles = [];

    for (const file of acceptedFiles) {
      try {
        setProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        let processedFile = file;
        if (settings.autoCompress && file.size > maxSize) {
          processedFile = await imageCompression(file, compressionOptions);
        }

        const preview = URL.createObjectURL(processedFile);
        newFiles.push({
          file: processedFile,
          preview,
          name: file.name,
          size: processedFile.size
        });

        setProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
  }, [files.length, maxFiles, maxSize, settings]);

  // إعداد منطقة الإسقاط
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize,
    onDrop
  });

  // التقاط صورة من الكاميرا
  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // هنا يمكن إضافة منطق التقاط الصورة من الكاميرا
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  // معالجة اقتصاص الصورة
  const handleCropComplete = (crop, percentCrop) => {
    setCrop(percentCrop);
  };

  // تطبيق الاقتصاص
  const handleCropApply = () => {
    if (imageRef.current && crop.width && crop.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        imageRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], currentImage.name, {
              type: 'image/jpeg'
            });
            setFiles(prev => prev.map(f => 
              f.name === currentImage.name 
                ? { ...f, file: croppedFile, preview: URL.createObjectURL(blob) }
                : f
            ));
          }
        },
        'image/jpeg',
        settings.quality
      );
    }
    setCropDialogOpen(false);
  };

  // حذف صورة
  const handleDelete = (file) => {
    setFiles(prev => prev.filter(f => f.name !== file.name));
    if (onDelete) {
      onDelete(file);
    }
  };

  // تحميل الصور
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files.map(f => f.file));
      setFiles([]);
    } catch (err) {
      console.error('Error uploading files:', err);
    }
    setUploading(false);
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
          border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          transition: 'all 0.2s'
        }}
      >
        <Box {...getRootProps()} sx={{ cursor: 'pointer' }}>
          <input {...getInputProps()} />
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" align="center">
              {isDragActive
                ? t('forms.photos.dropHere')
                : t('forms.photos.dragDrop')}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
              {t('forms.photos.allowedTypes')}
              <br />
              {t('forms.photos.maxSize', { size: '5MB' })}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="outlined"
            startIcon={<CameraAltIcon />}
            onClick={captureImage}
          >
            {t('forms.photos.capture')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            {t('common.settings')}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {(files.length > 0 || existingImages.length > 0) && (
        <Box mt={3}>
          <ImageList cols={4} gap={16}>
            {[...existingImages, ...files].map((file, index) => (
              <ImageListItem key={file.name || file.id}>
                <img
                  src={file.preview || file.url}
                  alt={`${index + 1}`}
                  loading="lazy"
                  style={{ height: 200, objectFit: 'cover' }}
                />
                <ImageListItemBar
                  title={`${t('forms.photos.photo')} ${index + 1}`}
                  actionIcon={
                    <Box>
                      {!file.id && (
                        <Tooltip title={t('common.crop')}>
                          <IconButton
                            sx={{ color: 'white' }}
                            onClick={() => {
                              setCurrentImage(file);
                              setCropDialogOpen(true);
                            }}
                          >
                            <CropIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => handleDelete(file)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
                {progress[file.name] !== undefined && progress[file.name] < 100 && (
                  <CircularProgress
                    variant="determinate"
                    value={progress[file.name]}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-20px',
                      marginLeft: '-20px'
                    }}
                  />
                )}
              </ImageListItem>
            ))}
          </ImageList>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="body2" color="textSecondary">
              {t('forms.photos.count', {
                current: files.length + existingImages.length,
                max: maxFiles
              })}
            </Typography>
            <Button
              variant="contained"
              disabled={uploading || files.length === 0}
              onClick={handleUpload}
              startIcon={uploading ? <CircularProgress size={20} /> : null}
            >
              {uploading ? t('common.uploading') : t('common.upload')}
            </Button>
          </Box>
        </Box>
      )}

      {/* حوار إعدادات الصور */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('forms.photos.settings.title')}</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <Typography gutterBottom>
              {t('forms.photos.settings.quality')} ({Math.round(settings.quality * 100)}%)
            </Typography>
            <Slider
              value={settings.quality * 100}
              onChange={(e, value) => setSettings(prev => ({ ...prev, quality: value / 100 }))}
              min={10}
              max={100}
            />
          </Box>

          <Box my={2}>
            <Typography gutterBottom>
              {t('forms.photos.settings.maxWidth')} ({settings.maxWidth}px)
            </Typography>
            <Slider
              value={settings.maxWidth}
              onChange={(e, value) => setSettings(prev => ({ ...prev, maxWidth: value }))}
              min={800}
              max={3840}
              step={160}
            />
          </Box>

          <Box my={2}>
            <Typography gutterBottom>
              {t('forms.photos.settings.maxHeight')} ({settings.maxHeight}px)
            </Typography>
            <Slider
              value={settings.maxHeight}
              onChange={(e, value) => setSettings(prev => ({ ...prev, maxHeight: value }))}
              min={600}
              max={2160}
              step={120}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={settings.preserveExif}
                onChange={(e) => setSettings(prev => ({ ...prev, preserveExif: e.target.checked }))}
              />
            }
            label={t('forms.photos.settings.preserveExif')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.autoCompress}
                onChange={(e) => setSettings(prev => ({ ...prev, autoCompress: e.target.checked }))}
              />
            }
            label={t('forms.photos.settings.autoCompress')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار اقتصاص الصور */}
      <Dialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('forms.photos.crop.title')}</DialogTitle>
        <DialogContent>
          {currentImage && (
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={handleCropComplete}
              aspect={16 / 9}
            >
              <img
                ref={imageRef}
                src={currentImage.preview}
                alt="Preview"
                style={{ maxWidth: '100%' }}
              />
            </ReactCrop>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCropApply} variant="contained">
            {t('common.apply')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUploader; 