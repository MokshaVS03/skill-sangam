import React, { useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  AppBar, 
  Toolbar,
  useTheme
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PatientIntakeForm from './components/PatientIntakeForm';
import StatusBoard from './components/StatusBoard';
import Notifications from './components/Notifications';
import { useAppContext } from './context/AppContext';
import DashboardHeader from './components/DashboardHeader';
import DoctorStatus from './components/DoctorStatus';

function App() {
  const { fetchDashboardData } = useAppContext();
  const theme = useTheme();
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Operating Theatre Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Hospital Medical System
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Notifications />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DashboardHeader />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <StatusBoard />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <PatientIntakeForm />
                </Grid>
                <Grid item xs={12}>
                  <DoctorStatus />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
        
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" align="center">
              © {new Date().getFullYear()} Operating Theatre Management System
            </Typography>
          </Container>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default App;