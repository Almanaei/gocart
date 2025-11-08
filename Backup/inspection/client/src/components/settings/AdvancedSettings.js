import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  Collapse,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import { useAppState } from '../../store/AppStateManager';

const AdvancedSettings = () => {
  const { t } = useTranslation();
  const { state, updateSettings } = useAppState();
  const [localSettings, setLocalSettings] = useState(state.settings);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // تحديث الإعدادات المحلية عند تغيير إعدادات التطبيق
  useEffect(() => {
    setLocalSettings(state.settings);
  }, [state.settings]);

  // حفظ الإعدادات
  const handleSave = () => {
    try {
      updateSettings(localSettings);
      showNotification('success', t('settings.saveSuccess'));
    } catch (error) {
      showNotification('error', t('settings.saveError'));
    }
  };

  // استعادة الإعدادات الافتراضية
  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      language: 'ar',
      direction: 'rtl',
      dateFormat: 'DD/MM/YYYY',
      autoSave: true,
      cacheTimeout: 5 * 60 * 1000,
      performance: {
        enableCache: true,
        cacheSize: 50,
        compressionQuality: 0.8,
        maxImageWidth: 1920,
        maxImageHeight: 1080,
        lazyLoading: true,
        prefetch: true
      },
      form: {
        autoValidate: true,
        validateOnBlur: true,
        showValidationHints: true,
        requireConfirmation: true,
        autosaveInterval: 60000
      },
      notifications: {
        enabled: true,
        position: 'bottom-center',
        duration: 5000,
        maxCount: 3
      },
      accessibility: {
        fontSize: 'medium',
        contrast: 'normal',
        animations: true,
        focusHighlight: true
      }
    };
    setLocalSettings(defaultSettings);
    showNotification('info', t('settings.resetSuccess'));
  };

  // عرض الإشعارات
  const showNotification = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            {t('settings.advanced.title')}
          </Typography>
          <Box>
            <Tooltip title={t('settings.reset')}>
              <IconButton onClick={handleReset} sx={{ mr: 1 }}>
                <RestoreIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              {t('common.save')}
            </Button>
          </Box>
        </Box>

        <Collapse in={showAlert}>
          <Alert severity={alertType} sx={{ mb: 2 }}>
            {alertMessage}
          </Alert>
        </Collapse>

        <Grid container spacing={4}>
          {/* إعدادات الأداء */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('settings.performance.title')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.performance.enableCache}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        performance: {
                          ...prev.performance,
                          enableCache: e.target.checked
                        }
                      }))}
                    />
                  }
                  label={t('settings.performance.enableCache')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label={t('settings.performance.cacheSize')}
                  value={localSettings.performance.cacheSize}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    performance: {
                      ...prev.performance,
                      cacheSize: parseInt(e.target.value)
                    }
                  }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">MB</InputAdornment>
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>
                  {t('settings.performance.compressionQuality')} ({Math.round(localSettings.performance.compressionQuality * 100)}%)
                </Typography>
                <Slider
                  value={localSettings.performance.compressionQuality * 100}
                  onChange={(e, value) => setLocalSettings(prev => ({
                    ...prev,
                    performance: {
                      ...prev.performance,
                      compressionQuality: value / 100
                    }
                  }))}
                  min={10}
                  max={100}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* إعدادات النموذج */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('settings.form.title')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.form.autoValidate}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        form: {
                          ...prev.form,
                          autoValidate: e.target.checked
                        }
                      }))}
                    />
                  }
                  label={t('settings.form.autoValidate')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label={t('settings.form.autosaveInterval')}
                  value={localSettings.form.autosaveInterval / 1000}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    form: {
                      ...prev.form,
                      autosaveInterval: parseInt(e.target.value) * 1000
                    }
                  }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('common.seconds')}</InputAdornment>
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>

          {/* إعدادات الإشعارات */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('settings.notifications.title')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.notifications.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label={t('settings.notifications.enabled')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  value={localSettings.notifications.position}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      position: e.target.value
                    }
                  }))}
                  fullWidth
                >
                  <MenuItem value="top-right">{t('settings.notifications.positions.topRight')}</MenuItem>
                  <MenuItem value="top-center">{t('settings.notifications.positions.topCenter')}</MenuItem>
                  <MenuItem value="top-left">{t('settings.notifications.positions.topLeft')}</MenuItem>
                  <MenuItem value="bottom-right">{t('settings.notifications.positions.bottomRight')}</MenuItem>
                  <MenuItem value="bottom-center">{t('settings.notifications.positions.bottomCenter')}</MenuItem>
                  <MenuItem value="bottom-left">{t('settings.notifications.positions.bottomLeft')}</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Grid>

          {/* إعدادات إمكانية الوصول */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('settings.accessibility.title')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Select
                  value={localSettings.accessibility.fontSize}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    accessibility: {
                      ...prev.accessibility,
                      fontSize: e.target.value
                    }
                  }))}
                  fullWidth
                >
                  <MenuItem value="small">{t('settings.accessibility.fontSizes.small')}</MenuItem>
                  <MenuItem value="medium">{t('settings.accessibility.fontSizes.medium')}</MenuItem>
                  <MenuItem value="large">{t('settings.accessibility.fontSizes.large')}</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  value={localSettings.accessibility.contrast}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    accessibility: {
                      ...prev.accessibility,
                      contrast: e.target.value
                    }
                  }))}
                  fullWidth
                >
                  <MenuItem value="normal">{t('settings.accessibility.contrast.normal')}</MenuItem>
                  <MenuItem value="high">{t('settings.accessibility.contrast.high')}</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.accessibility.animations}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        accessibility: {
                          ...prev.accessibility,
                          animations: e.target.checked
                        }
                      }))}
                    />
                  }
                  label={t('settings.accessibility.animations')}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdvancedSettings; 