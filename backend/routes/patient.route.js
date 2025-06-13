import express from 'express'
import Patient from '../models/patient.model.js'
const router = express.Router();

// Create new patient
router.post('/', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const saved = await patient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().populate('medicalHistory');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findById(id).populate('medicalHistory');  
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    } 
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
}
);

export default router;
