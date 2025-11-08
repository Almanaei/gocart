import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Paper,
  Box,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ResultsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

const InspectionResults = ({ data, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (field) => (event) => {
    const value = field === 'is_compliant' 
      ? event.target.value === 'true'
      : parseInt(event.target.value) || 0;
    
    onChange({ ...data, [field]: value });
  };

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {t('forms.results.title')}
      </Typography>

      <ResultsPaper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle1" gutterBottom color="primary">
                {t('forms.results.compliance')}
              </Typography>
              <RadioGroup
                value={data.is_compliant.toString()}
                onChange={handleChange('is_compliant')}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio color="success" />}
                  label={t('forms.results.compliant')}
                />
                <FormControlLabel
                  value="false"
                  control={<Radio color="error" />}
                  label={t('forms.results.nonCompliant')}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {data.is_compliant === false && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('forms.results.correctionDays')}
                value={data.correction_days || ''}
                onChange={handleChange('correction_days')}
                inputProps={{
                  min: 1,
                  max: 90
                }}
                helperText={t('forms.results.correctionDaysHelp')}
              />
            </Grid>
          )}
        </Grid>

        {data.is_compliant === false && data.correction_days > 0 && (
          <Box mt={3}>
            <Alert severity="warning">
              {t('forms.results.correctionWarning', {
                days: data.correction_days
              })}
            </Alert>
          </Box>
        )}

        {data.is_compliant === true && (
          <Box mt={3}>
            <Alert severity="success">
              {t('forms.results.complianceSuccess')}
            </Alert>
          </Box>
        )}
      </ResultsPaper>

      <Box mt={3}>
        <Typography variant="body2" color="textSecondary">
          {t('forms.results.note')}
        </Typography>
      </Box>
    </Box>
  );
};

export default InspectionResults; 