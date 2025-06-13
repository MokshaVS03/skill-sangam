import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctorId: String,
  name: String,
  specialization: String, // Cardiologist, Neurologist
  currentQueueSize: { type: Number, default: 0 },
  maxQueueLimit: Number
});

export default mongoose.model('Doctor', doctorSchema);