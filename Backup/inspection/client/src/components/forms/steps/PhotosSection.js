import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ImageUploader from '../ImageUploader';

const PhotosSection = ({ data, onChange, errors }) => {
  const { t } = useTranslation();

  const handleImagesChange = (newImages) => {
    onChange('photos', newImages);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('forms.photos.title')}
      </Typography>
      
      <ImageUploader
        images={data.photos}
        onChange={handleImagesChange}
        maxImages={8}
        error={errors?.photos}
      />
    </Box>
  );
};

export default PhotosSection; 