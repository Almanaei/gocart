import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { fetchForms, setFilters, setCurrentForm } from '../../store/slices/formsSlice';
import { openModal } from '../../store/slices/uiSlice';

// تعريف حالات النموذج وألوانها
const statusColors = {
  draft: 'default',
  submitted: 'primary',
  approved: 'success',
  rejected: 'error'
};

const FormsList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { forms, isLoading, pagination, filters } = useSelector(state => state.forms);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchForms({ page: pagination.page, limit: pagination.limit, filters }));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handlePageChange = (event, newPage) => {
    dispatch(setFilters({ ...filters, page: newPage + 1 }));
  };

  const handleLimitChange = (event) => {
    dispatch(setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    dispatch(setFilters({ ...filters, [name]: value, page: 1 }));
  };

  const handleCreateForm = () => {
    dispatch(openModal('createForm'));
  };

  const handleEditForm = (formId) => {
    dispatch(setCurrentForm(formId));
    dispatch(openModal('editForm'));
  };

  const handleViewForm = (formId) => {
    dispatch(setCurrentForm(formId));
    dispatch(openModal('viewForm'));
  };

  const handleDeleteForm = (formId) => {
    dispatch(setCurrentForm(formId));
    dispatch(openModal('deleteForm'));
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h1">
            {t('forms.title')}
          </Typography>
          {user?.role === 'inspector' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateForm}
            >
              {t('forms.create')}
            </Button>
          )}
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="status"
                  select
                  label={t('forms.status')}
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">{t('forms.statusAll')}</MenuItem>
                  <MenuItem value="draft">{t('forms.statusDraft')}</MenuItem>
                  <MenuItem value="submitted">{t('forms.statusSubmitted')}</MenuItem>
                  <MenuItem value="approved">{t('forms.statusApproved')}</MenuItem>
                  <MenuItem value="rejected">{t('forms.statusRejected')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  name="date"
                  label={t('forms.date')}
                  value={filters.date || ''}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  name="inspector"
                  label={t('forms.inspector')}
                  value={filters.inspector || ''}
                  onChange={handleFilterChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('forms.fileNo')}</TableCell>
                  <TableCell>{t('forms.referenceNo')}</TableCell>
                  <TableCell>{t('forms.occupancyName')}</TableCell>
                  <TableCell>{t('forms.area')}</TableCell>
                  <TableCell>{t('forms.status')}</TableCell>
                  <TableCell>{t('forms.previewDate')}</TableCell>
                  <TableCell align="center">{t('forms.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {t('forms.noForms')}
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>{form.file_no}</TableCell>
                      <TableCell>{form.reference_no}</TableCell>
                      <TableCell>{form.occupancy_name}</TableCell>
                      <TableCell>{form.area}</TableCell>
                      <TableCell>
                        <Chip
                          label={t(`forms.status${form.status.charAt(0).toUpperCase() + form.status.slice(1)}`)}
                          color={statusColors[form.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(form.preview_date).toLocaleDateString('ar-BH')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewForm(form.id)}
                          title={t('forms.view')}
                        >
                          <ViewIcon />
                        </IconButton>
                        {user?.role === 'inspector' && form.status === 'draft' && (
                          <IconButton
                            size="small"
                            onClick={() => handleEditForm(form.id)}
                            title={t('forms.edit')}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {user?.role === 'admin' && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteForm(form.id)}
                            title={t('forms.delete')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              rowsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
              labelRowsPerPage={t('common.rowsPerPage')}
              labelDisplayedRows={({ from, to, count }) => 
                t('common.displayedRows', { from, to, count })
              }
            />
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormsList; 