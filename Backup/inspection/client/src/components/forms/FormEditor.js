import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  ImageList,
  ImageListItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FormPrint from './FormPrint';
import { validateForm } from '../../utils/formValidation';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { usePrompt } from '../../hooks/usePrompt';

// استيراد المكونات الفرعية
import EstablishmentInfo from './steps/EstablishmentInfo';
import AddressInfo from './steps/AddressInfo';
import Requirements from './steps/Requirements';
import Observations from './steps/Observations';
import InspectionResults from './steps/InspectionResults';
import InspectorInfo from './steps/InspectorInfo';
import PhotosSection from './steps/PhotosSection';

// استيراد الإجراءات
import { setCurrentForm, saveFormDraft, submitForm } from '../../store/slices/formsSlice';
import { showNotification } from '../../store/slices/uiSlice';

// الأنماط المخصصة
const FormContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8)
}));

const NavigationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(3)
}));

// إضافة مكون تأكيد المغادرة
const LeaveConfirmDialog = ({ open, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{t('forms.leaveConfirm.title')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('forms.leaveConfirm.message')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t('forms.leaveConfirm.leave')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// مكون معاينة النموذج
const FormPreview = ({ data, onClose }) => {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={onClose}
      PaperProps={{
        sx: { width: '80%', maxWidth: 800, p: 3 }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('forms.preview.title')}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ overflowY: 'auto', pb: 3 }}>
        {/* معلومات المنشأة */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('forms.steps.establishment')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">{t('forms.establishment.occupancyName')}</Typography>
              <Typography>{data.form.occupancy_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">{t('forms.establishment.fileNo')}</Typography>
              <Typography>{data.form.file_no}</Typography>
            </Grid>
            {/* ... المزيد من المعلومات ... */}
          </Grid>
        </Paper>

        {/* العنوان */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('forms.steps.address')}
          </Typography>
          <Typography>
            {`${data.address.shop_flat || ''} ${data.address.building || ''}`}<br />
            {`${t('forms.address.road')} ${data.address.road || ''}`}<br />
            {`${t('forms.address.block')} ${data.address.block || ''}`}<br />
            {`${t('forms.address.area')} ${data.address.area || ''}`}
          </Typography>
        </Paper>

        {/* المتطلبات */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('forms.steps.requirements')}
          </Typography>
          <List>
            {Object.entries(data.requirements).map(([key, value]) => (
              <ListItem key={key}>
                <ListItemIcon>
                  {value ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                </ListItemIcon>
                <ListItemText primary={t(`forms.requirements.items.${key}`)} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* الملاحظات */}
        <Paper sx={{ p: 2, mb: 2 }}>
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
        </Paper>

        {/* نتائج التفتيش */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('forms.steps.results')}
          </Typography>
          <Alert severity={data.results.is_compliant ? 'success' : 'warning'}>
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
        </Paper>

        {/* معلومات المفتش */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('forms.steps.inspector')}
          </Typography>
          <Typography variant="subtitle2">{t('forms.inspector.name')}</Typography>
          <Typography paragraph>{data.inspector.name}</Typography>
          {data.inspector.signature_path && (
            <Box>
              <Typography variant="subtitle2">{t('forms.inspector.signature')}</Typography>
              <img
                src={data.inspector.signature_path}
                alt={t('forms.inspector.signature')}
                style={{ maxWidth: 200, marginTop: 8 }}
              />
            </Box>
          )}
        </Paper>

        {/* الصور */}
        {data.photos.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('forms.steps.photos')}
            </Typography>
            <ImageList cols={3} gap={8}>
              {data.photos.map((photo, index) => (
                <ImageListItem key={index}>
                  <img
                    src={photo.preview || photo.file_path}
                    alt={t('forms.photos.photoNumber', { number: index + 1 })}
                    loading="lazy"
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        )}
      </Box>
    </Drawer>
  );
};

const FormEditor = ({ formId = null }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentForm, isLoading, error } = useSelector(state => state.forms);
  const [activeStep, setActiveStep] = useState(0);
  
  // Create stable empty form state reference
  const emptyFormState = useMemo(() => ({
    form: {
      file_no: '',
      reference_no: '',
      occupancy_name: '',
      facility_nature: '',
      service_type: '',
      preview_date: new Date().toISOString().split('T')[0],
      status: 'draft'
    },
    address: {
      shop_flat: '',
      building: '',
      road: '',
      block: '',
      area: ''
    },
    requirements: {
      req1: false,
      req2: false,
      req3: false,
      req4: false,
      req5: false,
      req6: false,
      req7: false,
      req8: false,
      req9: false,
      req10: false,
      req11: false,
      req12: false,
      req13: false,
      req14: false,
      req15: false
    },
    observations: {
      observation1: '',
      observation2: '',
      observation3: '',
      observation4: '',
      observation5: '',
      observation6: ''
    },
    results: {
      is_compliant: false,
      correction_days: 0
    },
    inspector: {
      name: '',
      signature_path: ''
    },
    photos: []
  }), []);
  
  // Initialize state with the empty form state reference
  const [formData, setFormData] = useState(emptyFormState);
  const [errors, setErrors] = useState({});
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const printComponentRef = useRef();
  
  // تحميل بيانات النموذج عند التعديل - use initialization flag to prevent loop
  const initialLoadRef = useRef(false);
  
  useEffect(() => {
    if (formId && !initialLoadRef.current) {
      initialLoadRef.current = true;
      dispatch(setCurrentForm(formId));
    }
  }, [dispatch, formId]);

  // Update form data only when currentForm actually changes
  useEffect(() => {
    if (currentForm && JSON.stringify(currentForm) !== JSON.stringify(formData)) {
      setFormData(currentForm);
    }
  }, [currentForm]);

  // التعامل مع المغادرة
  const handleBeforeUnload = useCallback((event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = '';
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // تحديث وظيفة حفظ المسودة - prevent formData dependency
  const handleSaveDraft = useCallback(async () => {
    try {
      await dispatch(saveFormDraft(formData)).unwrap();
      setHasUnsavedChanges(false);
      dispatch(showNotification({
        message: t('forms.notifications.draftSaved'),
        severity: 'success'
      }));
      return true;
    } catch (error) {
      dispatch(showNotification({
        message: t('forms.notifications.saveFailed'),
        severity: 'error'
      }));
      return false;
    }
  }, [dispatch, t, formData]); // formData dependency is unavoidable here

  // الحفظ التلقائي - avoid formData dependency
  const autoSaveTimerRef = useRef(null);
  
  useEffect(() => {
    if (hasUnsavedChanges) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Set new timer
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await handleSaveDraft();
          setAutoSaveMessage(t('forms.autoSave.success'));
          
          // Clear success message after 3 seconds
          const messageTimer = setTimeout(() => setAutoSaveMessage(''), 3000);
          return () => clearTimeout(messageTimer);
        } catch (error) {
          setAutoSaveMessage(t('forms.autoSave.failed'));
          
          // Clear error message after 3 seconds
          const messageTimer = setTimeout(() => setAutoSaveMessage(''), 3000);
          return () => clearTimeout(messageTimer);
        }
      }, 30000); // حفظ تلقائي كل 30 ثانية
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, handleSaveDraft, t]);

  // خطوات النموذج
  const steps = [
    {
      label: t('forms.steps.establishment'),
      component: EstablishmentInfo,
      validate: (data) => {
        const errors = {};
        if (!data.form.occupancy_name) {
          errors.occupancy_name = t('forms.validation.occupancyRequired');
        }
        return errors;
      }
    },
    {
      label: t('forms.steps.address'),
      component: AddressInfo,
      validate: (data) => {
        const errors = {};
        if (!data.address.area) {
          errors.area = t('forms.validation.areaRequired');
        }
        return errors;
      }
    },
    {
      label: t('forms.steps.requirements'),
      component: Requirements,
      validate: () => ({})
    },
    {
      label: t('forms.steps.observations'),
      component: Observations,
      validate: () => ({})
    },
    {
      label: t('forms.steps.results'),
      component: InspectionResults,
      validate: (data) => {
        const errors = {};
        if (data.results.is_compliant === false && !data.results.correction_days) {
          errors.correction_days = t('forms.validation.correctionDaysRequired');
        }
        return errors;
      }
    },
    {
      label: t('forms.steps.inspector'),
      component: InspectorInfo,
      validate: (data) => {
        const errors = {};
        if (!data.inspector.name) {
          errors.inspector_name = t('forms.validation.inspectorNameRequired');
        }
        if (!data.inspector.signature_path) {
          errors.signature = t('forms.validation.signatureRequired');
        }
        return errors;
      }
    },
    {
      label: t('forms.steps.photos'),
      component: PhotosSection,
      validate: () => ({})
    }
  ];

  // تحديث وظيفة التحقق من صحة الخطوة
  const validateStep = () => {
    const stepValidation = steps[activeStep].validate(formData);
    setErrors(prevErrors => ({
      ...prevErrors,
      [activeStep]: stepValidation
    }));
    // If stepValidation is an empty object, the validation passed
    return Object.keys(stepValidation).length === 0;
  };

  // Use the custom prompt hook
  const { showPrompt, confirmNavigation, cancelNavigation } = usePrompt(
    hasUnsavedChanges,
    t('forms.leaveConfirm.message')
  );

  // Update LeaveConfirmDialog to use our custom hook handlers
  useEffect(() => {
    setShowLeaveConfirm(showPrompt);
  }, [showPrompt]);

  // تحديث وظيفة التحقق قبل الإرسال
  const validateBeforeSubmit = () => {
    const { isValid, firstInvalidStep, validations } = validateForm(formData);
    
    if (!isValid) {
      setActiveStep(firstInvalidStep);
      setErrors(Object.entries(validations).reduce((acc, [key, validation]) => {
        if (!validation.isValid) {
          acc[validation.step] = validation.errors;
        }
        return acc;
      }, {}));
      
      dispatch(showNotification({
        message: t('forms.notifications.validationErrors'),
        severity: 'error'
      }));
      return false;
    }
    
    return true;
  };

  // تحديث وظيفة الإرسال
  const handleSubmit = async () => {
    if (!validateBeforeSubmit()) {
      return;
    }

    try {
      await dispatch(submitForm(formData)).unwrap();
      setHasUnsavedChanges(false);
      dispatch(showNotification({
        message: t('forms.notifications.submitSuccess'),
        severity: 'success'
      }));
      navigate('/forms');
    } catch (error) {
      dispatch(showNotification({
        message: t('forms.notifications.submitFailed'),
        severity: 'error'
      }));
    }
  };

  // تحديث وظيفة التالي
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    } else {
      dispatch(showNotification({
        message: t('forms.notifications.stepValidationError'),
        severity: 'error'
      }));
    }
  };

  // تحديث وظيفة تغيير البيانات
  const handleDataChange = useCallback((field, value) => {
    // Handle image cleanup when photos are updated
    if (field === 'photos') {
      // Revoke old image URLs to prevent memory leaks
      formData.photos?.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    }

    // Process field parameter to get a consistent string regardless of what's passed
    let fieldName;
    if (typeof field === 'function') {
      // If it's a component reference (function), convert it to a consistent string
      fieldName = field.name.charAt(0).toLowerCase() + field.name.slice(1).replace('Info', '');
    } else if (typeof field === 'object' && field !== null) {
      // If it's an object but not null, use its constructor name or toString
      fieldName = (field.constructor && field.constructor.name) ? 
        field.constructor.name.charAt(0).toLowerCase() + field.constructor.name.slice(1) : 
        String(field);
    } else {
      // For strings and other primitives, use as is
      fieldName = field;
    }

    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
    setHasUnsavedChanges(true);
    
    // Clear validation errors for the updated field
    if (errors[fieldName]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: null
      }));
    }
  }, [formData.photos, errors]); // Only depend on formData.photos for URL cleanup

  // Cache all step components using useMemo
  const memoizedStepComponents = useMemo(() => steps.map(step => ({
    ...step,
    memoComponent: React.memo(step.component)
  })), [steps]);

  // عرض محتوى الخطوة الحالية - now using memoized components
  const getStepContent = useCallback((step) => {
    const StepComponent = memoizedStepComponents[step].memoComponent;
    
    // Create a consistent string key based on the component name
    const componentKey = steps[step].component.name
      .charAt(0).toLowerCase() + steps[step].component.name.slice(1).replace('Info', '');
    
    // Determine what data to pass based on the component
    let componentData;
    
    switch(componentKey) {
      case 'establishment':
        componentData = formData.form;
        break;
      case 'address':
      case 'requirements':
      case 'observations':
      case 'results':
      case 'inspector':
      case 'photos':
        componentData = formData[componentKey];
        break;
      default:
        componentData = formData;
    }
    
    return (
      <StepComponent
        key={`step-${step}`}
        data={componentData}
        onChange={(value) => handleDataChange(componentKey, value)}
        errors={errors[step] || {}}
      />
    );
  }, [formData, errors, memoizedStepComponents, handleDataChange, steps]);

  // Add cleanup function for images when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup image previews when component unmounts
      formData.photos?.forEach(photo => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [formData.photos]);

  // تأكيد المغادرة
  const handleConfirmLeave = () => {
    setHasUnsavedChanges(false);
    confirmNavigation();
  };

  // إلغاء المغادرة
  const handleCancelLeave = () => {
    cancelNavigation();
  };

  // الانتقال إلى الخطوة السابقة
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // معالجة عرض المعاينة
  const handlePreview = () => {
    setShowPreview(true);
  };

  // إضافة وظائف الطباعة وتصدير PDF
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `تقرير_تفتيش_${formData.form.file_no || new Date().getTime()}`,
  });

  const handleExportPDF = async () => {
    const element = printComponentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`تقرير_تفتيش_${formData.form.file_no || new Date().getTime()}.pdf`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* إضافة مكون الطباعة المخفي */}
      <Box sx={{ display: 'none' }}>
        <FormPrint ref={printComponentRef} data={formData} />
      </Box>

      <LeaveConfirmDialog
        open={showLeaveConfirm}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />

      {showPreview && (
        <FormPreview
          data={formData}
          onClose={() => setShowPreview(false)}
        />
      )}

      <Snackbar
        open={!!autoSaveMessage}
        message={autoSaveMessage}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />

      <FormContainer maxWidth="lg">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              {formId ? t('forms.edit.title') : t('forms.new.title')}
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
                sx={{ mr: 1 }}
              >
                {t('forms.preview.button')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ mr: 1 }}
              >
                {t('forms.print.button')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleExportPDF}
              >
                {t('forms.export.pdf')}
              </Button>
            </Box>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 4 }}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box>
            {getStepContent(activeStep)}

            <NavigationButtons>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                {t('common.back')}
              </Button>

              <Box>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  sx={{ mr: 1 }}
                >
                  {t('common.saveDraft')}
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {t('common.submit')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={isLoading || !validateStep()}
                  >
                    {t('common.next')}
                  </Button>
                )}
              </Box>
            </NavigationButtons>
          </Box>
        </Paper>
      </FormContainer>
    </>
  );
};

export default FormEditor; 