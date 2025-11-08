import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  Button,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import SignatureCanvas from 'react-signature-canvas';

const InspectorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

const SignatureBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  marginTop: theme.spacing(2),
  position: 'relative',
  '& canvas': {
    width: '100% !important',
    height: '200px !important'
  }
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.error.main
  }
}));

const InspectorInfo = ({ data, onChange }) => {
  const { t } = useTranslation();
  const signatureRef = useRef();
  const [signatureExists, setSignatureExists] = useState(!!data.signature_path);

  const handleNameChange = (event) => {
    onChange({
      ...data,
      name: event.target.value
    });
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      onChange({
        ...data,
        signature_path: signatureData
      });
      setSignatureExists(true);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onChange({
        ...data,
        signature_path: null
      });
      setSignatureExists(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {t('forms.inspector.title')}
      </Typography>

      <InspectorPaper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label={t('forms.inspector.name')}
              value={data.name || ''}
              onChange={handleNameChange}
              error={!data.name}
              helperText={!data.name && t('forms.inspector.nameRequired')}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              {t('forms.inspector.signature')}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {t('forms.inspector.signatureInstructions')}
            </Typography>

            <SignatureBox>
              <SignatureCanvas
                ref={signatureRef}
                onEnd={handleSignatureEnd}
                canvasProps={{
                  className: 'signature-canvas'
                }}
              />
              {signatureExists && (
                <ClearButton
                  size="small"
                  onClick={clearSignature}
                  aria-label={t('common.clear')}
                >
                  <DeleteIcon />
                </ClearButton>
              )}
            </SignatureBox>

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="primary"
                onClick={clearSignature}
                disabled={!signatureExists}
              >
                {t('forms.inspector.clearSignature')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </InspectorPaper>

      <Box mt={3}>
        <Typography variant="body2" color="textSecondary">
          {t('forms.inspector.note')}
        </Typography>
      </Box>
    </Box>
  );
};

export default InspectorInfo; 