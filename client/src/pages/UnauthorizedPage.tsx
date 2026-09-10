import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Home, Security } from '@mui/icons-material';

const UnauthorizedPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Security sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        You don't have permission to access this page.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Home />}
        component={RouterLink}
        to="/"
      >
        Go Home
      </Button>
    </Box>
  );
};

export default UnauthorizedPage;
