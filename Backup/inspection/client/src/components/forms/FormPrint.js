import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  styled
} from '@mui/material';

const PrintContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  '@media print': {
    padding: 0,
    backgroundColor: '#fff'
  }
}));

const PrintHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  '@media print': {
    marginBottom: theme.spacing(2)
  }
}));

const PrintSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '@media print': {
    boxShadow: 'none',
    marginBottom: theme.spacing(2)
  }
}));

const FormPrint = React.forwardRef(({ data }, ref) => {
  const { t } = useTranslation();

  return (
    <PrintContainer ref={ref}>
      <PrintHeader>
        <Typography variant="h4" gutterBottom>
          {t('forms.print.title')}
        </Typography>
        <Typography variant="subtitle1">
          {t('forms.print.date', { date: new Date().toLocaleDateString('ar-BH') })}
        </Typography>
      </PrintHeader>

      {/* معلومات المنشأة */}
      <PrintSection>
        <Typography variant="h6" gutterBottom>
          {t('forms.steps.establishment')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.establishment.fileNo')}</Typography>
            <Typography>{data.form.file_no}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.establishment.referenceNo')}</Typography>
            <Typography>{data.form.reference_no}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('forms.establishment.occupancyName')}</Typography>
            <Typography>{data.form.occupancy_name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.establishment.facilityNature')}</Typography>
            <Typography>{data.form.facility_nature}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.establishment.serviceType')}</Typography>
            <Typography>{data.form.service_type}</Typography>
          </Grid>
        </Grid>
      </PrintSection>

      {/* العنوان */}
      <PrintSection>
        <Typography variant="h6" gutterBottom>
          {t('forms.steps.address')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.address.shopFlat')}</Typography>
            <Typography>{data.address.shop_flat}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.address.building')}</Typography>
            <Typography>{data.address.building}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.address.road')}</Typography>
            <Typography>{data.address.road}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{t('forms.address.block')}</Typography>
            <Typography>{data.address.block}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('forms.address.area')}</Typography>
            <Typography>{data.address.area}</Typography>
          </Grid>
        </Grid>
      </PrintSection>

      {/* المتطلبات */}
      <PrintSection>
        <Typography variant="h6" gutterBottom>
          {t('forms.steps.requirements')}
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('forms.requirements.item')}</TableCell>
                <TableCell align="center">{t('forms.requirements.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data.requirements).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{t(`forms.requirements.items.${key}`)}</TableCell>
                  <TableCell align="center">
                    {value ? t('common.yes') : t('common.no')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </PrintSection>

      {/* الملاحظات */}
      <PrintSection>
        <Typography variant="h6" gutterBottom>
          {t('forms.steps.observations')}
        </Typography>
        {Object.entries(data.observations).map(([key, value]) => (
          value && (
            <Typography key={key} paragraph>
              • {value}
            </Typography>
          )
        ))}
      </PrintSection>

      {/* نتائج التفتيش */}
      <PrintSection>
        <Typography variant="h6" gutterBottom>
          {t('forms.steps.results')}
        </Typography>
        <Alert 
          severity={data.results.is_compliant ? 'success' : 'warning'}
          sx={{ '@media print': { border: '1px solid' } }}
        >
          {data.results.is_compliant
            ? t('forms.results.compliant')
            : t('forms.results.nonCompliant')}
          {!data.results.is_compliant && data.results.correction_days && (
            <Typography>
              {t('forms.results.correctionDaysMessage', {
                days: data.results.correction_days
              })}
            </Typography>
          )}
        </Alert>
      </PrintSection>

      {/* معلومات المفتش */}
      <PrintSection>
        <Typography variant="h6" gutterBottom>
          {t('forms.steps.inspector')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('forms.inspector.name')}</Typography>
            <Typography>{data.inspector.name}</Typography>
          </Grid>
          {data.inspector.signature_path && (
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('forms.inspector.signature')}</Typography>
              <Box mt={1}>
                <img
                  src={data.inspector.signature_path}
                  alt={t('forms.inspector.signature')}
                  style={{ maxWidth: 200 }}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </PrintSection>

      {/* الصور */}
      {data.photos.length > 0 && (
        <PrintSection>
          <Typography variant="h6" gutterBottom>
            {t('forms.steps.photos')}
          </Typography>
          <Grid container spacing={2}>
            {data.photos.map((photo, index) => (
              <Grid item xs={6} key={index}>
                <img
                  src={photo.preview || photo.file_path}
                  alt={t('forms.photos.photoNumber', { number: index + 1 })}
                  style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
                <Typography variant="caption" align="center" display="block">
                  {t('forms.photos.photoNumber', { number: index + 1 })}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </PrintSection>
      )}
    </PrintContainer>
  );
});

export default FormPrint; 