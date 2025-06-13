import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const OTDetailsDialog = ({ open, onClose, ot, doctor }) => {
  if (!ot) return null;
  
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
  
  const calculateTimeRemaining = (freeAt) => {
    if (!freeAt) return 'N/A';
    
    const end = moment(freeAt);
    const now = moment();
    
    if (end.isBefore(now)) return 'Completing';
    
    const duration = moment.duration(end.diff(now));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`;
  };
  
  const calculateDuration = (startTime, freeAt) => {
    if (!startTime || !freeAt) return 'N/A';
    
    const start = moment(startTime);
    const end = moment(freeAt);
    
    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: ot.status === 'occupied' ? 'error.light' : 'success.light' }}>
        <Box display="flex" alignItems="center">
          <MeetingRoomIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {ot.name} Details
            {ot.isEmergencyOT && (
              <Chip
                label="Emergency OT"
                color="warning"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Current Status
                </Typography>
                <Chip
                  label={ot.status.toUpperCase()}
                  color={getStatusColor(ot.status)}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              {ot.status === 'occupied' && ot.freeAt && (
                <Box textAlign="right">
                  <Typography variant="subtitle2" color="text.secondary">
                    Expected to be free at
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {moment(ot.freeAt).format('h:mm A')}
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    {calculateTimeRemaining(ot.freeAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {ot.status === 'occupied' && ot.patientInfo && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalHospitalIcon fontSize="small" sx={{ mr: 1 }} />
                  Patient Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="body1">
                  {ot.patientInfo.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Token Number
                </Typography>
                <Typography variant="body1">
                  {ot.patientInfo.token}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Procedure
                </Typography>
                <Typography variant="body1">
                  {ot.patientInfo.procedure}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Urgency
                </Typography>
                <Chip
                  label={ot.patientInfo.urgency.toUpperCase()}
                  color={getUrgencyColor(ot.patientInfo.urgency)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1">
                  {moment(ot.patientInfo.startTime).format('h:mm A')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {calculateDuration(ot.patientInfo.startTime, ot.freeAt)}
                </Typography>
              </Grid>
              
              {ot.patientInfo.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {ot.patientInfo.notes}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </>
          )}

          {ot.status === 'occupied' && doctor && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  Assigned Doctor
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Doctor Name
                </Typography>
                <Typography variant="body1">
                  {doctor.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Specialty
                </Typography>
                <Typography variant="body1">
                  {doctor.specialty}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button onClick={onClose} color="primary">
                Close
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default OTDetailsDialog;