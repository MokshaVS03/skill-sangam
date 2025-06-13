
import express from "express";
import hospitalData from "../data/hospital.js";

const router = express.Router();

router.post('/login',async (req, res) => {
  const { id, password } = req.body;
    const valid = hospitalData.doctors.some(doctor => 
      doctor.doctorId === id && doctor.password === password
    );
    if (valid) {   
      return res.status(200).json({ success: true, message: "Login successful" });
    }
    return res.status(401).json({ success: false, message: "Invalid credentials" });
})

export default router;