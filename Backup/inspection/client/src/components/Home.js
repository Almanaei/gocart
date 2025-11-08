import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('app.title')}
      </Typography>
      <Typography variant="body1">
        {t('app.welcome')}
      </Typography>
    </Box>
  );
};

export default Home; 