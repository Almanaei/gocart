import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  MenuItem
} from '@mui/material';

const EstablishmentInfo = ({ data, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ [name]: value });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="file_no"
          label={t('forms.fileNo')}
          value={data.file_no}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="reference_no"
          label={t('forms.referenceNo')}
          value={data.reference_no}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          name="occupancy_name"
          label={t('forms.occupancyName')}
          value={data.occupancy_name}
          onChange={handleChange}
          error={!data.occupancy_name.trim()}
          helperText={!data.occupancy_name.trim() && t('forms.errors.required')}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          name="facility_nature"
          label={t('forms.facilityNature')}
          value={data.facility_nature}
          onChange={handleChange}
        >
          <MenuItem value="commercial">{t('forms.facilityNatures.commercial')}</MenuItem>
          <MenuItem value="industrial">{t('forms.facilityNatures.industrial')}</MenuItem>
          <MenuItem value="residential">{t('forms.facilityNatures.residential')}</MenuItem>
          <MenuItem value="educational">{t('forms.facilityNatures.educational')}</MenuItem>
          <MenuItem value="healthcare">{t('forms.facilityNatures.healthcare')}</MenuItem>
          <MenuItem value="government">{t('forms.facilityNatures.government')}</MenuItem>
          <MenuItem value="other">{t('forms.facilityNatures.other')}</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          name="service_type"
          label={t('forms.serviceType')}
          value={data.service_type}
          onChange={handleChange}
        >
          <MenuItem value="new">{t('forms.serviceTypes.new')}</MenuItem>
          <MenuItem value="renewal">{t('forms.serviceTypes.renewal')}</MenuItem>
          <MenuItem value="complaint">{t('forms.serviceTypes.complaint')}</MenuItem>
          <MenuItem value="followup">{t('forms.serviceTypes.followup')}</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="date"
          name="preview_date"
          label={t('forms.previewDate')}
          value={data.preview_date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default EstablishmentInfo; 