import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  MenuItem
} from '@mui/material';

// قائمة المناطق في البحرين
const areas = [
  'المنامة',
  'المحرق',
  'الرفاع',
  'مدينة عيسى',
  'مدينة حمد',
  'جدحفص',
  'سترة',
  'البديع',
  'عالي',
  'سار',
  'توبلي',
  'الدير',
  'المالكية',
  'بني جمرة',
  'الدراز',
  'كرانة',
  'السنابس',
  'الجفير',
  'أم الحصم',
  'السيف',
  'ضاحية السيف',
  'الحد',
  'عراد',
  'الحورة',
  'القضيبية',
  'الجسرة',
  'البرهامة',
  'سلماباد',
  'النويدرات'
].sort();

const AddressInfo = ({ data, onChange }) => {
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
          name="shop_flat"
          label={t('forms.address.shopFlat')}
          value={data.shop_flat}
          onChange={handleChange}
          placeholder={t('forms.address.shopFlatPlaceholder')}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="building"
          label={t('forms.address.building')}
          value={data.building}
          onChange={handleChange}
          placeholder={t('forms.address.buildingPlaceholder')}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="road"
          label={t('forms.address.road')}
          value={data.road}
          onChange={handleChange}
          placeholder={t('forms.address.roadPlaceholder')}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="block"
          label={t('forms.address.block')}
          value={data.block}
          onChange={handleChange}
          placeholder={t('forms.address.blockPlaceholder')}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          select
          name="area"
          label={t('forms.address.area')}
          value={data.area}
          onChange={handleChange}
          error={!data.area.trim()}
          helperText={!data.area.trim() && t('forms.errors.required')}
        >
          {areas.map((area) => (
            <MenuItem key={area} value={area}>
              {area}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* عرض العنوان الكامل */}
      {(data.shop_flat || data.building || data.road || data.block || data.area) && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            disabled
            label={t('forms.address.fullAddress')}
            value={[
              data.shop_flat && `${t('forms.address.shopFlat')}: ${data.shop_flat}`,
              data.building && `${t('forms.address.building')}: ${data.building}`,
              data.road && `${t('forms.address.road')}: ${data.road}`,
              data.block && `${t('forms.address.block')}: ${data.block}`,
              data.area && `${t('forms.address.area')}: ${data.area}`
            ].filter(Boolean).join('، ')}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default AddressInfo; 