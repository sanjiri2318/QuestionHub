import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import type { QuestionPaper } from '@utils/types';

interface PDFPreviewDialogProps {
  paper: QuestionPaper | null;
  open: boolean;
  onClose: () => void;
  onDownload: (id: string, title: string) => void;
}

const PDFPreviewDialog = ({ paper, open, onClose, onDownload }: PDFPreviewDialogProps) => {
  const theme = useTheme();
  const isFullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!paper) return null;

  const previewUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/papers/${paper.id}/preview`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isFullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: isFullScreen ? '100%' : '85vh' },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1,
        }}
      >
        <Box sx={{ flex: 1, mr: 2 }}>
          <Typography variant="h6" fontWeight="bold" noWrap>
            {paper.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            {paper.subject && (
              <Chip label={paper.subject.name} size="small" variant="outlined" />
            )}
            <Chip
              label={`Sem ${paper.semester} | ${paper.examMonth} ${paper.examYear}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 0,
          }}
        >
          <iframe
            src={previewUrl}
            title={paper.title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              minHeight: '60vh',
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          onClick={() => onDownload(paper.id, paper.title)}
          variant="contained"
          startIcon={<Download />}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFPreviewDialog;
