const fs = require('fs');
const path = require('path');
const moment = require('moment');

const scheduleSurgery = (patientInfo, durationHours) => {
  try {
    // Read current data
    const doctorsPath = path.join(__dirname, '../data/doctors.json');
    const otsPath = path.join(__dirname, '../data/ots.json');
    
    let doctors = JSON.parse(fs.readFileSync(doctorsPath));
    let ots = JSON.parse(fs.readFileSync(otsPath));
    
    // Find available OT (non-emergency)
    const availableOT = ots.find(ot => ot.status === 'free' && !ot.isEmergencyOT);
    
    // Find available doctor
    const availableDoctor = doctors.find(doctor => doctor.status === 'free');
    
    if (!availableOT) {
      return { 
        success: false, 
        message: 'No operating theatres available at this time' 
      };
    }
    
    if (!availableDoctor) {
      return { 
        success: false, 
        message: 'No doctors available at this time' 
      };
    }
    
    // Calculate end time
    const endTime = moment().add(durationHours, 'hours').format();
    
    // Update OT
    availableOT.status = 'occupied';
    availableOT.freeAt = endTime;
    availableOT.patientInfo = {
      ...patientInfo,
      startTime: moment().format(),
      urgency: 'normal'
    };
    availableOT.doctorId = availableDoctor.id;
    
    // Update doctor status
    availableDoctor.status = 'assigned';
    
    // Save updated data
    fs.writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2));
    fs.writeFileSync(otsPath, JSON.stringify(ots, null, 2));
    
    return {
      success: true,
      message: `Surgery scheduled in ${availableOT.name} with ${availableDoctor.name}`,
      ot: availableOT,
      doctor: availableDoctor
    };
  } catch (error) {
    console.error('Error in scheduleSurgery:', error);
    return { success: false, message: 'Failed to schedule surgery' };
  }
};

module.exports = {
  scheduleSurgery
};