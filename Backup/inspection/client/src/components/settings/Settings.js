import React, { useState } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import BrushIcon from '@mui/icons-material/Brush';
import TuneIcon from '@mui/icons-material/Tune';
import AdvancedSettings from './AdvancedSettings';
import { useAppState } from '../../store/AppStateManager';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const { state, updateSettings } = useAppState();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    updateSettings({
      ...state.settings,
      language: newLanguage,
      direction: newLanguage === 'ar' ? 'rtl' : 'ltr'
    });
  };
  
  const handleThemeChange = (event) => {
    updateSettings({
      ...state.settings,
      theme: event.target.value
    });
  };
  
  const handleAutoSaveChange = (event) => {
    updateSettings({
      ...state.settings,
      autoSave: event.target.checked
    });
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="fullWidth"
        >
          <Tab icon={<BrushIcon />} label={t('settings.appearance')} />
          <Tab icon={<LanguageIcon />} label={t('settings.language')} />
          <Tab icon={<TuneIcon />} label={t('settings.advanced')} />
        </Tabs>
      </Paper>

      {/* Appearance Settings */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('settings.theme')}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="theme-select-label">{t('settings.selectTheme')}</InputLabel>
                  <Select
                    labelId="theme-select-label"
                    value={state.settings.theme}
                    label={t('settings.selectTheme')}
                    onChange={handleThemeChange}
                  >
                    <MenuItem value="light">{t('settings.lightTheme')}</MenuItem>
                    <MenuItem value="dark">{t('settings.darkTheme')}</MenuItem>
                    <MenuItem value="system">{t('settings.systemTheme')}</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('settings.behavior')}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={state.settings.autoSave}
                      onChange={handleAutoSaveChange}
                    />
                  }
                  label={t('settings.autoSave')}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Language Settings */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('settings.language')}
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="language-select-label">{t('settings.selectLanguage')}</InputLabel>
                  <Select
                    labelId="language-select-label"
                    value={state.settings.language}
                    label={t('settings.selectLanguage')}
                    onChange={handleLanguageChange}
                  >
                    <MenuItem value="ar">العربية</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Advanced Settings */}
      {activeTab === 2 && <AdvancedSettings />}
    </Container>
  );
};

export default Settings; 