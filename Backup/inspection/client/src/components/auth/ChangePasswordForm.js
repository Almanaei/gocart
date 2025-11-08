import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { changePassword } from '../../store/slices/authSlice';
import { closeModal } from '../../store/slices/uiSlice';

// مخطط التحقق
const validationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('auth.currentPasswordRequired'),
  newPassword: Yup.string()
    .required('auth.newPasswordRequired')
    .min(8, 'auth.passwordMinLength')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'auth.passwordComplexity'
    ),
  confirmPassword: Yup.string()
    .required('auth.confirmPasswordRequired')
    .oneOf([Yup.ref('newPassword')], 'auth.passwordMismatch')
});

const ChangePasswordForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  const { modals } = useSelector(state => state.ui);

  const handleClose = () => {
    dispatch(closeModal('changePassword'));
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })).unwrap();
      resetForm();
      handleClose();
    } catch (err) {
      // تم معالجة الخطأ في reducer
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={modals.changePassword}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('auth.changePassword')}</DialogTitle>
      
      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting
        }) => (
          <Form>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                id="currentPassword"
                name="currentPassword"
                type="password"
                label={t('auth.currentPassword')}
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.currentPassword && Boolean(errors.currentPassword)}
                helperText={touched.currentPassword && t(errors.currentPassword)}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                margin="normal"
                id="newPassword"
                name="newPassword"
                type="password"
                label={t('auth.newPassword')}
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && t(errors.newPassword)}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                margin="normal"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label={t('auth.confirmPassword')}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && t(errors.confirmPassword)}
                disabled={isLoading}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {t(error)}
                </Alert>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('common.save')
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ChangePasswordForm; 