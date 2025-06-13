import mongoose from 'mongoose';
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config();
import patientRoutes from './routes/patient.route.js';
import tokenRoutes from './routes/token.route.js';
import {inngest} from './lib/inngest.js';
import { serve } from "inngest/express"; 
import { assignDoctor, dynamicDoctorAssignment } from "./lib/doctorAI.js";
import signIn from './routes/auth.router.js';
const app = express();

app.use(cors())

app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tlsAllowInvalidCertificates: true, // only for testing
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use("/api/inngest", serve({ 
  client: inngest,
  functions: [assignDoctor, dynamicDoctorAssignment]
}));



app.use('/api/tokens', tokenRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api',signIn)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("GEMINI_KEY:", process.env.GEMINI_KEY);
});