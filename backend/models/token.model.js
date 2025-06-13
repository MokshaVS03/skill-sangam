import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  tokenId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  symptoms: { type: String, required: true },
  currentDepartment: String,
  description: String,
  assignedDoctor: String,
  status: { 
    type: String, 
    enum: ['Waiting', 'Consulting', 'Pharmacy', 'Discharged'],
    default: 'Waiting'
  },
  steps: [{
    department: String,
    doctor: String,
    action: String,
    medicines: [String],
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Token', tokenSchema);