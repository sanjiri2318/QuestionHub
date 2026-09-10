import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const RootLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Outlet />
    </Box>
  );
};

export default RootLayout;
