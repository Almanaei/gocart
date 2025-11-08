import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// الأنماط المخصصة
const Input = styled('input')({
  display: 'none'
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

const PhotoUploader = ({ 
  photos = [], 
  onUpload, 
  onDelete, 
  maxPhotos = 8,
  isUploading = false,
  error = null
}) => {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      // يمكن إضافة إشعار هنا
      return;
    }

    const allowedFiles = files.slice(0, remainingSlots);
    onUpload(allowedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {t('forms.photos')} ({photos.length}/{maxPhotos})
      </Typography>

      {photos.length < maxPhotos && (
        <UploadBox
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            backgroundColor: dragOver ? 'action.hover' : 'background.paper',
            mb: 2
          }}
        >
          <Input
            accept="image/*"
            id="photo-upload"
            multiple
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <label htmlFor="photo-upload">
            <Button
              component="span"
              startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
              disabled={isUploading}
            >
              {t('forms.uploadPhotos')}
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {t('forms.dragDropHint')}
          </Typography>
        </UploadBox>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {photos.length > 0 && (
        <ImageList cols={4} gap={8}>
          {photos.map((photo, index) => (
            <ImageListItem key={photo.id || index}>
              <img
                src={photo.url || URL.createObjectURL(photo)}
                alt={`صورة ${index + 1}`}
                loading="lazy"
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => onDelete(photo)}
                    disabled={isUploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* زر الكاميرا للأجهزة المحمولة */}
      <Input
        accept="image/*"
        id="camera-capture"
        type="file"
        capture="environment"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <label htmlFor="camera-capture">
        <IconButton
          color="primary"
          component="span"
          disabled={isUploading || photos.length >= maxPhotos}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'background.paper',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'background.paper'
            }
          }}
        >
          <CameraIcon />
        </IconButton>
      </label>
    </Box>
  );
};

export default PhotoUploader; 