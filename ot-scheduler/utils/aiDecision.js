const moment = require('moment');

/**
 * AI decision agent that finds the least critical surgery to reschedule
 * when an emergency requires immediate attention and no resources are available.
 */
const findLeastCriticalSurgery = (ots, doctors) => {
  try {
    // Score each ongoing surgery based on multiple factors
    const scoredSurgeries = ots
      .filter(ot => ot.status === 'occupied' && ot.patientInfo && !ot.isEmergencyOT)
      .map(ot => {
        // Get the doctor assigned to this surgery
        const assignedDoctor = doctors.find(d => d.id === ot.doctorId);
        
        // Calculate how long the surgery has been going
        const surgeryStartTime = moment(ot.patientInfo.startTime);
        const surgeryDuration = moment().diff(surgeryStartTime, 'minutes');
        
        // Calculate expected time left (assume the surgery ends at freeAt time)
        const timeLeft = ot.freeAt ? moment(ot.freeAt).diff(moment(), 'minutes') : 60;
        
        // Determine if surgery is almost complete
        const isNearlyComplete = timeLeft < 20; // If less than 20 minutes left
        
        // Determine urgency factor
        let urgencyFactor = 1;
        if (ot.patientInfo.urgency === 'high') urgencyFactor = 3;
        if (ot.patientInfo.urgency === 'urgent') urgencyFactor = 2;
        
        // Calculate interruptibility score (higher = more interruptible)
        let interruptibilityScore = 100;
        
        // Reduce score based on urgency
        interruptibilityScore /= urgencyFactor;
        
        // Heavily penalize interrupting nearly complete surgeries
        if (isNearlyComplete) {
          interruptibilityScore *= 0.2;
        }
        
        // Penalize interrupting just-started surgeries
        if (surgeryDuration < 15) {
          interruptibilityScore *= 0.7;
        }
        
        // Favor interrupting surgeries with more time left
        interruptibilityScore *= (timeLeft / 120); // Normalize to a ~2 hour surgery
        
        return {
          ot,
          doctor: assignedDoctor,
          score: interruptibilityScore,
          timeLeft,
          surgeryDuration
        };
      });
    
    // Sort by score (highest = most interruptible)
    scoredSurgeries.sort((a, b) => b.score - a.score);
    
    // If no surgeries can be interrupted
    if (scoredSurgeries.length === 0) {
      return { success: false, message: 'No surgeries available to reschedule' };
    }
    
    // Choose the most interruptible surgery
    const surgeryToReschedule = scoredSurgeries[0];
    
    // Free up the doctor for emergency use
    if (surgeryToReschedule.doctor) {
      surgeryToReschedule.doctor.status = 'free';
    }
    
    // Update the chosen OT
    surgeryToReschedule.ot.status = 'free';
    surgeryToReschedule.ot.freeAt = null;
    surgeryToReschedule.ot.doctorId = null;
    
    // Store the interrupted patient info for later rescheduling
    const interruptedPatient = {
      ...surgeryToReschedule.ot.patientInfo,
      interruptedAt: moment().format(),
      remainingTime: surgeryToReschedule.timeLeft,
      priority: 'high' // Increase priority when rescheduling
    };
    
    // Clear the current patient
    surgeryToReschedule.ot.patientInfo = null;
    
    return {
      success: true,
      message: `Surgery in ${surgeryToReschedule.ot.name} rescheduled to accommodate emergency`,
      ot: surgeryToReschedule.ot,
      doctor: surgeryToReschedule.doctor,
      interruptedPatient
    };
  } catch (error) {
    console.error('Error in AI decision making:', error);
    return { success: false, message: 'AI decision engine error' };
  }
};