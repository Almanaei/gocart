import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Box,
  Tab,
  Tabs
} from '@mui/material';
import CustomRequirements from '../CustomRequirements';

const Requirements = ({ data, onChange, errors }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const handleStandardRequirementChange = (key) => (event) => {
    onChange('requirements', {
      ...data.requirements,
      [key]: event.target.checked
    });
  };

  const handleCustomRequirementsChange = (newRequirements) => {
    onChange('customRequirements', newRequirements);
  };

  const standardRequirements = [
    { key: 'req1', label: t('form.requirements.req1') },
    { key: 'req2', label: t('form.requirements.req2') },
    { key: 'req3', label: t('form.requirements.req3') },
    { key: 'req4', label: t('form.requirements.req4') },
    { key: 'req5', label: t('form.requirements.req5') },
    { key: 'req6', label: t('form.requirements.req6') },
    { key: 'req7', label: t('form.requirements.req7') },
    { key: 'req8', label: t('form.requirements.req8') },
    { key: 'req9', label: t('form.requirements.req9') },
    { key: 'req10', label: t('form.requirements.req10') },
    { key: 'req11', label: t('form.requirements.req11') },
    { key: 'req12', label: t('form.requirements.req12') },
    { key: 'req13', label: t('form.requirements.req13') },
    { key: 'req14', label: t('form.requirements.req14') },
    { key: 'req15', label: t('form.requirements.req15') }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('form.requirements.title')}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('form.requirements.standard')} />
          <Tab label={t('form.requirements.custom.title')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <Box>
              {standardRequirements.map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={data.requirements[key] || false}
                      onChange={handleStandardRequirementChange(key)}
                      color="primary"
                    />
                  }
                  label={label}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <CustomRequirements
              requirements={data.customRequirements || []}
              onChange={handleCustomRequirementsChange}
            />
          )}
        </Box>
      </Paper>

      {errors && Object.keys(errors).length > 0 && (
        <Typography color="error" variant="body2">
          {Object.values(errors).join(', ')}
        </Typography>
      )}
    </Box>
  );
};

export default Requirements; 