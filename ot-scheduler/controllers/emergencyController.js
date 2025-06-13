const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { findLeastCriticalSurgery } = require('../utils/aiDecision');

const handleEmergency = (patientInfo) => {
  try {
    // Read current data
    const doctorsPath = path.join(__dirname, '../data/doctors.json');
    const otsPath = path.join(__dirname, '../data/ots.json');
    
    let doctors = JSON.parse(fs.readFileSync(doctorsPath));
    let ots = JSON.parse(fs.readFileSync(otsPath));
    
    // Generate emergency token
    const emergencyToken = `EMERG-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Enhanced patient info for emergency
    const emergencyPatient = {
      ...patientInfo,
      token: patientInfo.token || emergencyToken,
      urgency: 'emergency',
      startTime: moment().format()
    };
    
    // First try to find a truly free doctor (not assigned to any OT)
    let assignedDoctor = doctors.find(doctor => doctor.status === 'free');
    
    // If no free doctor, check for on-call doctors
    if (!assignedDoctor) {
      assignedDoctor = doctors.find(doctor => doctor.status === 'on-call');
      if (assignedDoctor) {
        assignedDoctor.status = 'assigned';
      }
    }
    
    // Check for available OT (non-emergency first)
    let availableOT = ots.find(ot => ot.status === 'free' && !ot.isEmergencyOT);
    
    // If no regular OT is available, check emergency OT
    if (!availableOT) {
      availableOT = ots.find(ot => ot.status === 'free' && ot.isEmergencyOT);
    }
    
    // If still no doctor available, we need to reassign a doctor from a less critical surgery
    if (!assignedDoctor) {
      // Find all currently occupied OTs and their assigned doctors
      const occupiedOTs = ots.filter(ot => 
        ot.status === 'occupied' && 
        ot.patientInfo && 
        ot.patientInfo.urgency !== 'emergency'
      );
      
      // Use AI to find least critical surgery
      const result = findLeastCriticalSurgery(occupiedOTs, doctors);
      
      if (result.success) {
        const { ot: rescheduledOT, doctor: rescheduledDoctor } = result;
        
        // Free up the doctor from the less critical surgery
        assignedDoctor = rescheduledDoctor;
        assignedDoctor.status = 'assigned';
        
        // If we also need an OT, use the one we just freed up
        if (!availableOT) {
          availableOT = rescheduledOT;
        }
        
        // Save the interrupted surgery details for rescheduling
        const interruptedSurgery = {
          ...rescheduledOT.patientInfo,
          originalOT: rescheduledOT.name,
          interruptedAt: moment().format(),
          priority: 'high'
        };
        
        // Clear the rescheduled OT
        rescheduledOT.status = 'free';
        rescheduledOT.freeAt = null;
        rescheduledOT.patientInfo = null;
        rescheduledOT.doctorId = null;
      }
    }
    
    // If we still have no resources available
    if (!availableOT || !assignedDoctor) {
      return { 
        success: false, 
        message: 'Unable to handle emergency: no resources available and no suitable surgery to reschedule' 
      };
    }
    
    // Update OT and doctor for emergency
    availableOT.status = 'occupied';
    availableOT.freeAt = moment().add(2, 'hours').format(); // Emergency surgeries typically take ~2 hours
    availableOT.patientInfo = emergencyPatient;
    availableOT.doctorId = assignedDoctor.id;
    assignedDoctor.status = 'assigned';
    
    // Save updated data
    fs.writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2));
    fs.writeFileSync(otsPath, JSON.stringify(ots, null, 2));
    
    return {
      success: true,
      message: `EMERGENCY: Surgery scheduled in ${availableOT.name} with ${assignedDoctor.name}`,
      ot: availableOT,
      doctor: assignedDoctor
    };
  } catch (error) {
    console.error('Error in handleEmergency:', error);
    return { success: false, message: 'Failed to handle emergency' };
  }
};