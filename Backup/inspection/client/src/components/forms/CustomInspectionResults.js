import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Paper,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const CustomInspectionResults = ({ data, onChange, errors }) => {
  const { t } = useTranslation();
  const [editDialog, setEditDialog] = useState({ open: false, type: '', item: null });
  const [error, setError] = useState('');

  // نموذج للمعايير الإضافية
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    isCritical: false
  });

  // نموذج للتوصيات
  const [newRecommendation, setNewRecommendation] = useState({
    text: '',
    priority: 'normal'
  });

  const handleComplianceChange = (event) => {
    onChange({
      ...data,
      isCompliant: event.target.value === 'true'
    });
  };

  const handleCorrectionDaysChange = (event) => {
    const days = parseInt(event.target.value, 10);
    if (!isNaN(days) && days >= 0) {
      onChange({
        ...data,
        correctionDays: days
      });
    }
  };

  const handleAddCriteria = () => {
    if (!newCriteria.name.trim() || !newCriteria.description.trim()) {
      setError(t('validation.required'));
      return;
    }

    const criteria = data.criteria || [];
    onChange({
      ...data,
      criteria: [...criteria, { ...newCriteria, id: Date.now() }]
    });

    setNewCriteria({ name: '', description: '', isCritical: false });
    setEditDialog({ open: false, type: '', item: null });
    setError('');
  };

  const handleAddRecommendation = () => {
    if (!newRecommendation.text.trim()) {
      setError(t('validation.required'));
      return;
    }

    const recommendations = data.recommendations || [];
    onChange({
      ...data,
      recommendations: [...recommendations, { ...newRecommendation, id: Date.now() }]
    });

    setNewRecommendation({ text: '', priority: 'normal' });
    setEditDialog({ open: false, type: '', item: null });
    setError('');
  };

  const handleDeleteCriteria = (criteriaId) => {
    const criteria = data.criteria || [];
    onChange({
      ...data,
      criteria: criteria.filter(c => c.id !== criteriaId)
    });
  };

  const handleDeleteRecommendation = (recommendationId) => {
    const recommendations = data.recommendations || [];
    onChange({
      ...data,
      recommendations: recommendations.filter(r => r.id !== recommendationId)
    });
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('form.result.compliance')}
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            value={data.isCompliant?.toString() || 'false'}
            onChange={handleComplianceChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label={t('form.result.compliant')}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label={t('form.result.nonCompliant')}
            />
          </RadioGroup>
        </FormControl>

        {data.isCompliant === false && (
          <TextField
            type="number"
            label={t('form.result.correctionDays')}
            value={data.correctionDays || ''}
            onChange={handleCorrectionDaysChange}
            fullWidth
            margin="normal"
            inputProps={{ min: 1, max: 90 }}
            error={!!errors?.correctionDays}
            helperText={errors?.correctionDays}
          />
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('form.result.criteria')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setEditDialog({ open: true, type: 'criteria', item: null })}
            variant="outlined"
            size="small"
          >
            {t('form.result.addCriteria')}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {(data.criteria || []).map((criteria) => (
            <Grid item xs={12} key={criteria.id}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="subtitle1" gutterBottom>
                      {criteria.name}
                      {criteria.isCritical && (
                        <Chip
                          icon={<PriorityHighIcon />}
                          label={t('form.result.critical')}
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {criteria.description}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title={t('common.delete')}>
                      <IconButton onClick={() => handleDeleteCriteria(criteria.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {t('form.result.recommendations')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setEditDialog({ open: true, type: 'recommendation', item: null })}
            variant="outlined"
            size="small"
          >
            {t('form.result.addRecommendation')}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {(data.recommendations || []).map((recommendation) => (
            <Grid item xs={12} key={recommendation.id}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="body1">
                      {recommendation.text}
                    </Typography>
                    <Chip
                      label={t(`form.result.priority.${recommendation.priority}`)}
                      color={recommendation.priority === 'high' ? 'error' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Tooltip title={t('common.delete')}>
                      <IconButton onClick={() => handleDeleteRecommendation(recommendation.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* حوار إضافة/تعديل المعايير */}
      <Dialog
        open={editDialog.open && editDialog.type === 'criteria'}
        onClose={() => setEditDialog({ open: false, type: '', item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('form.result.addCriteria')}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label={t('form.result.criteriaName')}
            value={newCriteria.name}
            onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('form.result.criteriaDescription')}
            value={newCriteria.description}
            onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Radio
                checked={newCriteria.isCritical}
                onChange={(e) => setNewCriteria({ ...newCriteria, isCritical: e.target.checked })}
                color="error"
              />
            }
            label={t('form.result.markCritical')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, type: '', item: null })}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAddCriteria} variant="contained">
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* حوار إضافة/تعديل التوصيات */}
      <Dialog
        open={editDialog.open && editDialog.type === 'recommendation'}
        onClose={() => setEditDialog({ open: false, type: '', item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('form.result.addRecommendation')}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={t('form.result.recommendationText')}
            value={newRecommendation.text}
            onChange={(e) => setNewRecommendation({ ...newRecommendation, text: e.target.value })}
            margin="normal"
          />
          <FormControl component="fieldset" margin="normal">
            <Typography variant="subtitle2" gutterBottom>
              {t('form.result.priority.label')}
            </Typography>
            <RadioGroup
              value={newRecommendation.priority}
              onChange={(e) => setNewRecommendation({ ...newRecommendation, priority: e.target.value })}
            >
              <FormControlLabel
                value="low"
                control={<Radio />}
                label={t('form.result.priority.low')}
              />
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label={t('form.result.priority.normal')}
              />
              <FormControlLabel
                value="high"
                control={<Radio />}
                label={t('form.result.priority.high')}
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, type: '', item: null })}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAddRecommendation} variant="contained">
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomInspectionResults; 