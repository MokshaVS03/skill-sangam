import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  address: String,
  emergencyContact: {
    name: String,
    number: String
  },
  medicalConditions: {
    type: String
  },
  medicalHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token'
  }]
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
