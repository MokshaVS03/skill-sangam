import { inngest } from "../lib/inngest.js"; // Inngest client
import Token from "../models/token.model.js"; // Token model
import queue from '../data/queue.js'
import express from 'express';
const router = express.Router();


router.post("/create-token", async (req, res) => {
  const { patientId, symptoms, department } = req.body;

  // 1. Validate input
  if (!patientId || !symptoms || !department) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 2. Generate token ID
  const tokenId = `TOK_${Date.now()}`;
  

try {
    // 3. Trigger AI analysis (Inngest event)
    await inngest.send({
      name: "ai/assign.doctor",
      data: { patientId, tokenId, symptoms, department },
    });
  
} catch (error) {
  console.error("Error sending Inngest event:", error);
}
  await Token.create({
    tokenId,
    patient:patientId,
    currentDepartment:department,
    symptoms
  })

  res.json({ 
    status: "AI analysis started",
    tokenId 
  });
});


router.post('/next-step/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  const { action, medicines, nextDepartment } = req.body;

  // 1. Find and validate token
  const token = await Token.findOne({ tokenId });
  if (!token) return res.status(404).json({ error: "Token not found" });

  //delete remove current token from queue
  queue[token.currentDepartment][token.assignedDoctor] = queue[token.currentDepartment][token.assignedDoctor].filter(t => t.tokenId !== tokenId);
  const meds = medicines.split(' ') || [];
  // 2. Record current step
  token.steps.push({
    department: token.currentDepartment,
    doctor: token.assignedDoctor,
    action,
    medicines: meds
  });

  // 3. Handle next step
  if (nextDepartment === 'Discharged') {
    token.status = 'Discharged';
    token.currentDepartment = null; // Clear department on discharge
    await patientModel.findByIdAndUpdate(token.patient, { $push: { medicalHistory: token._id } });
  } else if (nextDepartment === 'Pharmacy') {
    token.status = 'Pharmacy';
    token.currentDepartment = nextDepartment;
    console.log("Pharmacy step reached, no AI needed");
  } else {
    token.currentDepartment = nextDepartment;
    token.assignedDoctor = null; // Reset for AI reassignment
    token.status = 'Waiting';
    
    // Trigger AI for new doctor assignment
    await inngest.send({
      name: "ai/doctor.assignment",
      data: { 
        tokenId,
        context: `Previous steps: ${JSON.stringify(token.steps)}`,
        department: nextDepartment
      }
    });
  }

  await token.save();
  res.json({ success: true, token });
});



router.get('/tokens', async (req, res) => {
  try {
    const tokens = await Token.find().populate('patient');
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/token/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  try {
    const token = await Token.findOne({ tokenId }).populate('patient');
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }
    res.json(token);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
}
);


export default router;