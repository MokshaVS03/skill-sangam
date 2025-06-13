import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useAppContext } from '../context/AppContext';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const procedures = [
  'Appendectomy',
  'Gallbladder Removal',
  'Hernia Repair',
  'Hip Replacement',
  'Knee Replacement',
  'Cataract Surgery',
  'Coronary Bypass',
  'Angioplasty',
  'Hysterectomy',
  'Tonsillectomy'
];

const PatientIntakeForm = () => {
  const { scheduleSurgery, handleEmergency } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    token: '',
    procedure: '',
    duration: 1,
    scheduledTime: new Date(),
    urgency: 'normal',
    notes: ''
  });
  
  const [isEmergency, setIsEmergency] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (newDate) => {
    setFormData(prev => ({ ...prev, scheduledTime: newDate }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const patientInfo = {
      id: `P${Math.floor(1000 + Math.random() * 9000)}`, // Generate dummy ID
      name: formData.name,
      token: formData.token || `TKN${Math.floor(1000 + Math.random() * 9000)}`,
      procedure: formData.procedure,
      urgency: isEmergency ? 'emergency' : formData.urgency,
      notes: formData.notes
    };
    
    if (isEmergency) {
      await handleEmergency(patientInfo);
    } else {
      await scheduleSurgery(patientInfo, formData.duration);
    }
    
    // Reset form
    setFormData({
      name: '',
      token: '',
      procedure: '',
      duration: 1,
      scheduledTime: new Date(),
      urgency: 'normal',
      notes: ''
    });
    setIsEmergency(false);
  };
  
  const handleEmergencyMode = () => {
    setIsEmergency(true);
  };
  
  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <LocalHospitalIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
          <Typography variant="h6" component="h2" color="primary">
            Patient Intake
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Patient Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="token"
                label="Token Number"
                value={formData.token}
                onChange={handleChange}
                fullWidth
                margin="dense"
                helperText={isEmergency ? "Auto-generated for emergency" : "From central DB"}
                disabled={isEmergency}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Procedure Type</InputLabel>
                <Select
                  name="procedure"
                  value={formData.procedure}
                  onChange={handleChange}
                  required
                >
                  {procedures.map(proc => (
                    <MenuItem key={proc} value={proc}>{proc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Urgency</InputLabel>
                <Select
                  name="urgency"
                  value={isEmergency ? 'emergency' : formData.urgency}
                  onChange={handleChange}
                  disabled={isEmergency}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                  <MenuItem value="emergency" disabled={!isEmergency}>Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="duration"
                label="Estimated Duration (hours)"
                type="number"
                InputProps={{ inputProps: { min: 0.01, max: 12, step: 0.5 } }}
                value={formData.duration}
                onChange={handleChange}
                fullWidth
                required
                margin="dense"
              />
            </Grid>
            
            <Grid item xs={12}>
              <DateTimePicker
                label="Scheduled Time"
                value={formData.scheduledTime}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                disabled={isEmergency}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                margin="dense"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              type="button"
              variant="contained"
              color="error"
              startIcon={<PriorityHighIcon />}
              onClick={handleEmergencyMode}
              disabled={isEmergency}
              sx={{ 
                bgcolor: 'error.main', 
                '&:hover': { bgcolor: 'error.dark' },
                animation: isEmergency ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(234, 67, 53, 0.7)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(234, 67, 53, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(234, 67, 53, 0)' }
                }
              }}
            >
              Emergency Case
            </Button>
            
            <Button 
              type="submit"
              variant="contained" 
              color={isEmergency ? "error" : "primary"}
              startIcon={isEmergency ? <PriorityHighIcon /> : <AccessTimeIcon />}
            >
              {isEmergency ? 'Process Emergency' : 'Schedule Surgery'}
            </Button>
          </Stack>
          
          {isEmergency && (
            <Box mt={2} p={1.5} bgcolor="error.light" borderRadius={1}>
              <Typography variant="body2" color="error.contrastText" fontWeight="medium">
                EMERGENCY MODE ACTIVATED: This will override normal scheduling and prioritize this case.
              </Typography>
            </Box>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientIntakeForm;