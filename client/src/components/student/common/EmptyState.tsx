import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const EmptyState = ({ icon, title, description, action, sx }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2,
        ...sx,
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2, fontSize: 64, lineHeight: 1 }}>
        {icon}
      </Box>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
};

export default EmptyState;
