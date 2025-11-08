import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const FormProgress = ({ 
  activeStep, 
  steps, 
  completedSteps, 
  errors, 
  warnings,
  onStepClick,
  progress 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // حساب حالة كل خطوة
  const getStepStatus = (stepIndex) => {
    if (errors && errors[stepIndex]?.length > 0) {
      return 'error';
    }
    if (warnings && warnings[stepIndex]?.length > 0) {
      return 'warning';
    }
    if (completedSteps.includes(stepIndex)) {
      return 'completed';
    }
    return 'pending';
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  // الحصول على لون الخلفية حسب الحالة
  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return alpha(theme.palette.success.main, 0.1);
      case 'error':
        return alpha(theme.palette.error.main, 0.1);
      case 'warning':
        return alpha(theme.palette.warning.main, 0.1);
      default:
        return 'transparent';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ width: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="div">
            {t('form.progress.title')}
          </Typography>
          <Chip
            label={`${Math.round(progress)}%`}
            color={progress === 100 ? 'success' : 'primary'}
            variant={progress === 100 ? 'filled' : 'outlined'}
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mb: 3,
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4
            }
          }}
        />

        <Stepper
          nonLinear
          activeStep={activeStep}
          alternativeLabel
          sx={{
            '& .MuiStepConnector-line': {
              borderColor: alpha(theme.palette.divider, 0.3)
            }
          }}
        >
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const stepErrors = errors && errors[index];
            const stepWarnings = warnings && warnings[index];

            return (
              <Step key={step.label} completed={completedSteps.includes(index)}>
                <StepButton
                  onClick={() => onStepClick(index)}
                  sx={{
                    '& .MuiStepLabel-root': {
                      backgroundColor: getStepColor(status),
                      borderRadius: 2,
                      p: 2,
                      transition: 'background-color 0.2s'
                    }
                  }}
                >
                  <StepLabel
                    StepIconComponent={() => getStatusIcon(status)}
                    error={status === 'error'}
                  >
                    <Typography
                      variant="subtitle2"
                      color={status === 'error' ? 'error' : 'textPrimary'}
                    >
                      {t(step.label)}
                    </Typography>
                    
                    {(stepErrors || stepWarnings) && (
                      <Box mt={1}>
                        {stepErrors && stepErrors.map((error, i) => (
                          <Typography
                            key={`error-${i}`}
                            variant="caption"
                            color="error"
                            display="block"
                          >
                            {t(error)}
                          </Typography>
                        ))}
                        
                        {stepWarnings && stepWarnings.map((warning, i) => (
                          <Typography
                            key={`warning-${i}`}
                            variant="caption"
                            color="warning.main"
                            display="block"
                          >
                            {t(warning)}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </StepLabel>
                </StepButton>
              </Step>
            );
          })}
        </Stepper>

        <Box mt={3}>
          <Typography variant="body2" color="textSecondary">
            {t('form.progress.hint')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormProgress; 