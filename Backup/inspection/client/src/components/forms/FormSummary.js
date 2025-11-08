import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PersonIcon from '@mui/icons-material/Person';

const FormSummary = ({ 
  form, 
  address, 
  requirements = {}, 
  observations = [], 
  results = {}, 
  photos = [], 
  inspector = {},
  validationStatus = {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // حساب نسبة المتطلبات المستوفاة
  const calculateRequirementsCompletion = () => {
    const totalReqs = Object.keys(requirements).length;
    if (totalReqs === 0) return 0;
    
    const completedReqs = Object.values(requirements).filter(Boolean).length;
    return Math.round((completedReqs / totalReqs) * 100);
  };

  // الحصول على لون حالة النموذج
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return theme.palette.info.main;
      case 'approved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  // الحصول على أيقونة حالة التحقق
  const getValidationIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <AccessTimeIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {t('form.summary.title')}
        </Typography>
        <Chip
          label={t(`form.status.${form.status || 'draft'}`)}
          color="primary"
          sx={{
            backgroundColor: getStatusColor(form.status),
            color: '#fff'
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* معلومات المنشأة */}
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              {t('form.establishment.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary={form.occupancy_name}
                  secondary={`${t('form.establishment.fileNo')}: ${form.file_no || '-'}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary={address.area}
                  secondary={`${address.building || '-'}, ${t('form.address.block')} ${address.block || '-'}`}
                />
              </ListItem>
            </List>
          </Box>
        </Grid>

        {/* ملخص المتطلبات */}
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              {t('form.summary.requirements')}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                {`${calculateRequirementsCompletion()}%`}
              </Box>
              <Box flex={1}>
                <Typography variant="body2" color="textSecondary">
                  {t('form.summary.requirementsProgress')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* حالة التحقق */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t('form.summary.validation')}
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(validationStatus).map(([key, status]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: alpha(
                      status === 'error' ? theme.palette.error.main :
                      status === 'warning' ? theme.palette.warning.main :
                      status === 'valid' ? theme.palette.success.main :
                      theme.palette.grey[500],
                      0.1
                    )
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {getValidationIcon(status)}
                    <Typography variant="body2">
                      {t(`form.progress.steps.${key}`)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* معلومات إضافية */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <PhotoLibraryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">
                  {photos.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('form.summary.totalPhotos')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">
                  {observations.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('form.summary.totalObservations')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">
                  {inspector.name || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('form.inspector.title')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FormSummary; 