import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  Typography,
  Box,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomObservations from '../CustomObservations';

const Observations = ({ data, onChange, errors }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const handleStandardObservationChange = (index, value) => {
    const newObservations = { ...data.observations };
    newObservations[`observation${index + 1}`] = value;
    onChange('observations', newObservations);
  };

  const handleCustomObservationsChange = (newObservations) => {
    onChange('customObservations', newObservations);
  };

  const handleAddStandardObservation = () => {
    const currentCount = Object.keys(data.observations || {}).length;
    if (currentCount < 6) {
      const newObservations = { ...data.observations };
      newObservations[`observation${currentCount + 1}`] = '';
      onChange('observations', newObservations);
    }
  };

  const handleDeleteStandardObservation = (index) => {
    const newObservations = { ...data.observations };
    delete newObservations[`observation${index + 1}`];
    
    // Reorder remaining observations
    const values = Object.values(newObservations).filter(Boolean);
    const reorderedObservations = {};
    values.forEach((value, i) => {
      reorderedObservations[`observation${i + 1}`] = value;
    });
    
    onChange('observations', reorderedObservations);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('form.observations.title')}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('form.observations.standard')} />
          <Tab label={t('form.observations.custom.title')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <Box>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Tooltip title={t('form.observations.add')}>
                  <IconButton
                    onClick={handleAddStandardObservation}
                    disabled={Object.keys(data.observations || {}).length >= 6}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Grid container spacing={2}>
                {Object.entries(data.observations || {}).map(([key, value], index) => (
                  <Grid item xs={12} key={key}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={value}
                        onChange={(e) => handleStandardObservationChange(index, e.target.value)}
                        label={t('form.observations.observation', { number: index + 1 })}
                        error={errors?.observations?.[key]}
                        helperText={errors?.observations?.[key]}
                      />
                      <Tooltip title={t('common.delete')}>
                        <IconButton onClick={() => handleDeleteStandardObservation(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <CustomObservations
              observations={data.customObservations || []}
              onChange={handleCustomObservationsChange}
            />
          )}
        </Box>
      </Paper>

      {errors && typeof errors === 'string' && (
        <Typography color="error" variant="body2">
          {errors}
        </Typography>
      )}
    </Box>
  );
};

export default Observations; 