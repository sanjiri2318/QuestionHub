import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';

const NotFoundPage = () => {
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
      <Typography variant="h1" sx={{ fontWeight: 'bold', mb: 1 }} color="primary">
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          component={RouterLink}
          to="/"
        >
          Go Home
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
