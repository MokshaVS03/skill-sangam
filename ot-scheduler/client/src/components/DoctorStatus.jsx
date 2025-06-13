import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useAppContext } from '../context/AppContext';

const DoctorStatus = () => {
  const { doctors, loading, ots } = useAppContext();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  const getOtForDoctor = (doctorId) => {
    return ots.find(ot => ot.doctorId === doctorId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free':
        return 'success';
      case 'assigned':
        return 'primary';
      case 'on-call':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (specialty) => {
    const colorMap = {
      'Cardiology': '#e57373',
      'Neurosurgery': '#64b5f6',
      'Orthopedics': '#81c784',
      'General': '#9575cd',
      'Vascular': '#4db6ac',
      'ENT': '#fff176',
      'Urology': '#ffb74d',
      'Pediatric': '#4fc3f7',
      'Plastic': '#f06292',
      'Thoracic': '#ba68c8',
      'Trauma': '#ff8a65',
      'Oncology': '#7986cb'
    };

    return colorMap[specialty] || '#90a4ae';
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PersonIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
          <Typography variant="h6" component="h2" color="primary">
            Doctor Status
          </Typography>
        </Box>

        <List disablePadding>
          {doctors.map((doctor, index) => {
            const assignedOT = getOtForDoctor(doctor.id);

            return (
              <React.Fragment key={doctor.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Avatar 
                      sx={{ 
                        bgcolor: getAvatarColor(doctor.specialty),
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(doctor.name)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex\" alignItems="center\" justifyContent="space-between">
                        <Typography variant="body1\" component="span">
                          {doctor.name}
                        </Typography>
                        <Chip
                          label={doctor.status.toUpperCase()}
                          color={getStatusColor(doctor.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {doctor.specialty}
                        </Typography>
                        
                        {assignedOT && (
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <LocalHospitalIcon fontSize="inherit" sx={{ mr: 0.5, color: 'primary.main' }} />
                            <Typography variant="body2" color="primary.main">
                              Assigned to {assignedOT.name}
                              {assignedOT.patientInfo && (
                                <span> - {assignedOT.patientInfo.procedure}</span>
                              )}
                            </Typography>
                          </Box>
                        )}
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default DoctorStatus;