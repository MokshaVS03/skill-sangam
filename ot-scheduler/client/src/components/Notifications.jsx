import React from 'react';
import { Alert, Snackbar, Box } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const Notifications = () => {
  const { notification } = useAppContext();
  
  if (!notification) return null;
  
  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1400 }}>
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;