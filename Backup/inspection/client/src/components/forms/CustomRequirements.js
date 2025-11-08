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
  Alert
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

const CustomRequirements = ({ requirements, onChange }) => {
  const { t } = useTranslation();
  const [editDialog, setEditDialog] = useState({ open: false, index: -1, text: '' });
  const [addDialog, setAddDialog] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [error, setError] = useState('');

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(requirements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const handleEdit = (index) => {
    setEditDialog({
      open: true,
      index,
      text: requirements[index]
    });
  };

  const handleEditSave = () => {
    if (!editDialog.text.trim()) {
      setError(t('validation.required'));
      return;
    }

    const newRequirements = [...requirements];
    newRequirements[editDialog.index] = editDialog.text.trim();
    onChange(newRequirements);
    setEditDialog({ open: false, index: -1, text: '' });
    setError('');
  };

  const handleDelete = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    onChange(newRequirements);
  };

  const handleAdd = () => {
    if (!newRequirement.trim()) {
      setError(t('validation.required'));
      return;
    }

    onChange([...requirements, newRequirement.trim()]);
    setAddDialog(false);
    setNewRequirement('');
    setError('');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {t('forms.requirements.custom.title')}
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setAddDialog(true)}
          variant="outlined"
          size="small"
        >
          {t('forms.requirements.custom.add')}
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="requirements">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {requirements.map((req, index) => (
                <Draggable key={index} draggableId={`req-${index}`} index={index}>
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}
                    >
                      <ListItemIcon {...provided.dragHandleProps}>
                        <DragIndicatorIcon />
                      </ListItemIcon>
                      <ListItemText primary={req} />
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

      {/* إضافة متطلب جديد */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('forms.requirements.custom.addNew')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            label={t('forms.requirements.custom.requirement')}
            error={!!error}
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

      {/* تعديل متطلب */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, index: -1, text: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>{t('forms.requirements.custom.edit')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={editDialog.text}
            onChange={(e) => setEditDialog({ ...editDialog, text: e.target.value })}
            label={t('forms.requirements.custom.requirement')}
            error={!!error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, index: -1, text: '' })}>
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

export default CustomRequirements; 