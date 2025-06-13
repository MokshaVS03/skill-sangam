import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useAppContext } from '../context/AppContext';
import moment from 'moment';
import OTDetailsDialog from './OTDetailsDialog';

const StatusBoard = () => {
  const { ots, loading, doctors } = useAppContext();
  const [tabValue, setTabValue] = useState(0);
  const [selectedOT, setSelectedOT] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (ot) => {
    setSelectedOT(ot);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free':
        return 'success';
      case 'occupied':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return 'error';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'info';
      default:
        return 'default';
    }
  };

  const getDoctorById = (id) => {
    return doctors.find(doc => doc.id === id) || { name: 'Unassigned', specialty: 'N/A' };
  };

  const calculateTimeRemaining = (freeAt) => {
    if (!freeAt) return 'N/A';
    
    const end = moment(freeAt);
    const now = moment();
    
    if (end.isBefore(now)) return 'Completing';
    
    const duration = moment.duration(end.diff(now));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  const occupiedOTs = ots.filter(ot => ot.status === 'occupied');
  const freeOTs = ots.filter(ot => ot.status === 'free');
  const emergencyOT = ots.find(ot => ot.isEmergencyOT);

  return (
    <>
      <Card elevation={3} sx={{ minHeight: '600px' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <MeetingRoomIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
            <Typography variant="h6" component="h2" color="primary">
              Operating Theatre Status Board
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="status tabs">
              <Tab label={`All OTs (${ots.length})`} />
              <Tab label={`Occupied (${occupiedOTs.length})`} />
              <Tab label={`Available (${freeOTs.length})`} />
            </Tabs>
          </Box>

          {emergencyOT && (
            <Box mb={2}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  bgcolor: emergencyOT.status === 'occupied' ? 'error.light' : 'success.light',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: emergencyOT.status === 'occupied' ? 'error.main' : 'success.main'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <MedicalServicesIcon sx={{ mr: 1, color: emergencyOT.status === 'occupied' ? 'error.dark' : 'success.dark' }} />
                    <Typography variant="subtitle2" fontWeight="bold" color={emergencyOT.status === 'occupied' ? 'error.dark' : 'success.dark'}>
                      Emergency OT: {emergencyOT.name}
                    </Typography>
                  </Box>
                  <Chip 
                    label={emergencyOT.status === 'occupied' ? 'IN USE' : 'AVAILABLE'} 
                    color={emergencyOT.status === 'occupied' ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
                {emergencyOT.status === 'occupied' && emergencyOT.patientInfo && (
                  <Box mt={1}>
                    <Typography variant="body2" color="error.dark">
                      <strong>Emergency Case:</strong> {emergencyOT.patientInfo.procedure} ({calculateTimeRemaining(emergencyOT.freeAt)} remaining)
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>OT</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Doctor</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Procedure</strong></TableCell>
                  <TableCell><strong>Time Remaining</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ots
                  .filter(ot => 
                    tabValue === 0 || 
                    (tabValue === 1 && ot.status === 'occupied') || 
                    (tabValue === 2 && ot.status === 'free')
                  )
                  .map((ot) => {
                    const doctor = getDoctorById(ot.doctorId);
                    
                    return (
                      <TableRow 
                        key={ot.id}
                        sx={{ 
                          '&:hover': { backgroundColor: '#f9f9f9' },
                          backgroundColor: ot.isEmergencyOT ? '#fff8e1' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" fontWeight={ot.isEmergencyOT ? 'bold' : 'normal'}>
                              {ot.name}
                            </Typography>
                            {ot.isEmergencyOT && (
                              <Chip 
                                label="Emergency" 
                                size="small" 
                                color="warning" 
                                sx={{ ml: 1, height: 20 }} 
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ot.status.toUpperCase()}
                            color={getStatusColor(ot.status)}
                            size="small"
                            sx={{ minWidth: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          {ot.doctorId ? (
                            <Tooltip title={`Specialty: ${doctor.specialty}`}>
                              <Box display="flex" alignItems="center">
                                <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main', fontSize: 16 }} />
                                <Typography variant="body2">{doctor.name}</Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {ot.patientInfo ? (
                            <Typography variant="body2">
                              {ot.patientInfo.name}
                              {ot.patientInfo.urgency === 'emergency' && (
                                <Chip
                                  label="EMERG"
                                  color="error"
                                  size="small"
                                  sx={{ ml: 1, height: 20 }}
                                />
                              )}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {ot.patientInfo?.procedure ? (
                            <Typography variant="body2">{ot.patientInfo.procedure}</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {ot.status === 'occupied' ? (
                            <Box display="flex\" alignItems="center">
                              <AccessTimeIcon fontSize="small\" sx={{ mr: 0.5, color: 'info.main', fontSize: 16 }} />
                              <Typography variant="body2">
                                {calculateTimeRemaining(ot.freeAt)}
                              </Typography>
                            </Box>
                          ) : (
                            <Chip label="Available" size="small" color="success" sx={{ minWidth: 80 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleViewDetails(ot)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {moment().format('MMMM D, YYYY h:mm A')} - Real-time updates active
            </Typography>
            <Box>
              <Chip 
                label={`${freeOTs.length} Available`} 
                color="success" 
                size="small" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={`${occupiedOTs.length} Occupied`} 
                color="error" 
                size="small" 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {selectedOT && (
        <OTDetailsDialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          ot={selectedOT}
          doctor={getDoctorById(selectedOT.doctorId)}
        />
      )}
    </>
  );
};

export default StatusBoard;