import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { login } from '../../store/slices/authSlice';

// الأنماط المخصصة
const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: '100px auto',
  textAlign: 'center',
  '& .MuiTextField-root': {
    marginBottom: theme.spacing(2)
  }
}));

// مخطط التحقق
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('auth.usernameRequired'),
  password: Yup.string()
    .required('auth.passwordRequired')
});

const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      // تم معالجة الخطأ في reducer
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <LoginPaper elevation={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('auth.login')}
        </Typography>

        <Formik
          initialValues={{
            username: '',
            password: ''
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
              <TextField
                fullWidth
                id="username"
                name="username"
                label={t('auth.username')}
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && t(errors.username)}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                type="password"
                label={t('auth.password')}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && t(errors.password)}
                disabled={isLoading}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {t(error)}
                </Alert>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || isSubmitting}
                sx={{ mt: 2 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('auth.login')
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </LoginPaper>
    </Box>
  );
};

export default LoginForm; 