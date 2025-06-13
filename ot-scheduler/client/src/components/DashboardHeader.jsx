import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useAppContext } from '../context/AppContext';

const DashboardHeader = () => {
  const { ots, doctors, loading } = useAppContext();
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size={30} />
      </Box>
    );
  }
  
  const freeOTs = ots.filter(ot => ot.status === 'free').length;
  const occupiedOTs = ots.filter(ot => ot.status === 'occupied').length;
  const emergencyOTs = ots.filter(ot => ot.isEmergencyOT).length;
  
  const freeDoctors = doctors.filter(doctor => doctor.status === 'free').length;
  const assignedDoctors = doctors.filter(doctor => doctor.status === 'assigned').length;
  const onCallDoctors = doctors.filter(doctor => doctor.status === 'on-call').length;
  
  const emergencyCases = ots.filter(ot => 
    ot.status === 'occupied' && 
    ot.patientInfo && 
    ot.patientInfo.urgency === 'emergency'
  ).length;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        borderRadius: 2,
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" fontWeight="500" mb={1}>
            Operating Theatre Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }} mb={2}>
            Real-time management and monitoring of operating theatres, doctors, and surgeries
          </Typography>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip 
              label={`${freeOTs} OTs Available`} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 'medium'
              }}
            />
            <Chip 
              label={`${occupiedOTs} OTs Occupied`} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 'medium'
              }}
            />
            <Chip 
              label={`${emergencyOTs} Emergency OTs`} 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 'medium'
              }}
            />
            {emergencyCases > 0 && (
              <Chip 
                label={`${emergencyCases} Emergency Cases`} 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white',
                  fontWeight: 'medium'
                }}
              />
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="flex-end" height="100%" alignItems="center">
            <Box textAlign="right">
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Doctor Availability
              </Typography>
              <Typography variant="h6" fontWeight="medium">
                {freeDoctors} Available / {assignedDoctors} Assigned / {onCallDoctors} On-Call
              </Typography>
              
              <Box display="flex" justifyContent="flex-end" mt={1} gap={1}>
                <Chip 
                  label={`${freeDoctors} Free`} 
                  size="small"
                  sx={{ 
                    bgcolor: 'success.main', 
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                />
                <Chip 
                  label={`${assignedDoctors} Assigned`} 
                  size="small"
                  sx={{ 
                    bgcolor: 'info.main', 
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                />
                <Chip 
                  label={`${onCallDoctors} On-Call`} 
                  size="small"
                  sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DashboardHeader;