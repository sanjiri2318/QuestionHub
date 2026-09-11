import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  Download,
  Visibility,
  CalendarMonth,
  School,
} from '@mui/icons-material';
import type { QuestionPaper } from '@utils/types';

interface PaperCardProps {
  paper: QuestionPaper;
  onBookmark: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
  onDownload: (id: string, title: string) => void;
  onPreview: (paper: QuestionPaper) => void;
  isBookmarkLoading?: boolean;
  isDownloadLoading?: boolean;
}

const PaperCard = ({
  paper,
  onBookmark,
  onRemoveBookmark,
  onDownload,
  onPreview,
}: PaperCardProps) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0,0,0,0.4)'
              : '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              flex: 1,
              mr: 1,
            }}
          >
            {paper.title}
          </Typography>
          <Tooltip title={paper.isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
            <IconButton
              size="small"
              onClick={() =>
                paper.isBookmarked
                  ? onRemoveBookmark(paper.id)
                  : onBookmark(paper.id)
              }
            >
              {paper.isBookmarked ? (
                <Bookmark color="primary" />
              ) : (
                <BookmarkBorder />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {paper.subject && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {paper.subject.name}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            icon={<School sx={{ fontSize: 14 }} />}
            label={`Sem ${paper.semester}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<CalendarMonth sx={{ fontSize: 14 }} />}
            label={`${paper.examMonth} ${paper.examYear}`}
            size="small"
            variant="outlined"
          />
          {paper.department && (
            <Chip
              label={paper.department.name}
              size="small"
              variant="outlined"
              sx={{ maxWidth: 140 }}
            />
          )}
        </Stack>

        {paper._count && (
          <Typography variant="caption" color="text.secondary">
            {paper._count.downloads} download{paper._count.downloads !== 1 ? 's' : ''}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ p: 1.5, pt: 0, display: 'flex', gap: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title="Preview PDF">
          <IconButton size="small" onClick={() => onPreview(paper)} color="primary">
            <Visibility />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download PDF">
          <IconButton
            size="small"
            onClick={() => onDownload(paper.id, paper.title)}
            color="primary"
          >
            <Download />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default PaperCard;
