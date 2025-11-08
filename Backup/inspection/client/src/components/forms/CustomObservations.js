import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  FormControlLabel,
  Checkbox,
  Chip
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useTranslation } from 'react-i18next';

const CustomObservations = ({ observations, onChange }) => {
  const { t } = useTranslation();
  const [editDialog, setEditDialog] = useState({ open: false, index: -1, observation: null });
  const [addDialog, setAddDialog] = useState(false);
  const [newObservation, setNewObservation] = useState({ text: '', critical: false });
  const [error, setError] = useState('');

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(observations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const handleEdit = (index) => {
    setEditDialog({
      open: true,
      index,
      observation: observations[index]
    });
  };

  const handleEditSave = () => {
    if (!editDialog.observation.text.trim()) {
      setError(t('validation.required'));
      return;
    }

    const newObservations = [...observations];
    newObservations[editDialog.index] = {
      ...editDialog.observation,
      text: editDialog.observation.text.trim()
    };
    onChange(newObservations);
    setEditDialog({ open: false, index: -1, observation: null });
    setError('');
  };

  const handleDelete = (index) => {
    const newObservations = observations.filter((_, i) => i !== index);
    onChange(newObservations);
  };

  const handleAdd = () => {
    if (!newObservation.text.trim()) {
      setError(t('validation.required'));
      return;
    }

    onChange([...observations, { ...newObservation, text: newObservation.text.trim() }]);
    setAddDialog(false);
    setNewObservation({ text: '', critical: false });
    setError('');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('forms.observations.custom.title')}
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setAddDialog(true)}
          variant="outlined"
          size="small"
        >
          {t('forms.observations.custom.add')}
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="observations">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {observations.map((obs, index) => (
                <Draggable key={index} draggableId={`obs-${index}`} index={index}>
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}
                    >
                      <ListItemIcon {...provided.dragHandleProps}>
                        <DragIndicatorIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={obs.text}
                        secondary={
                          obs.critical && (
                            <Chip
                              icon={<PriorityHighIcon />}
                              label={t('forms.observations.custom.critical')}
                              color="error"
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title={t('common.edit')}>
                          <IconButton edge="end" onClick={() => handleEdit(index)} sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton edge="end" onClick={() => handleDelete(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      {/* إضافة ملاحظة جديدة */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('forms.observations.custom.addNew')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={newObservation.text}
            onChange={(e) => setNewObservation({ ...newObservation, text: e.target.value })}
            label={t('forms.observations.custom.observation')}
            error={!!error}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newObservation.critical}
                onChange={(e) => setNewObservation({ ...newObservation, critical: e.target.checked })}
                color="error"
              />
            }
            label={t('forms.observations.custom.markCritical')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAdd} variant="contained">
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* تعديل ملاحظة */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, index: -1, observation: null })} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{t('forms.observations.custom.edit')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={editDialog.observation?.text || ''}
            onChange={(e) => setEditDialog({ 
              ...editDialog, 
              observation: { ...editDialog.observation, text: e.target.value }
            })}
            label={t('forms.observations.custom.observation')}
            error={!!error}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editDialog.observation?.critical || false}
                onChange={(e) => setEditDialog({
                  ...editDialog,
                  observation: { ...editDialog.observation, critical: e.target.checked }
                })}
                color="error"
              />
            }
            label={t('forms.observations.custom.markCritical')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, index: -1, observation: null })}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleEditSave} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomObservations; 