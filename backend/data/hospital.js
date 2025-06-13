export default   {
  // All Staff (1 receptionist + 1 staff per department)
  staff: [
    {
      staffId: "REC_001",
      name: "Reception Head",
      department: "Reception",
      password: "reception@123"
    },
    {
      staffId: "STAFF_CARDIO",
      name: "Cardiology Staff",
      department: "Cardiology",
      password: "cardio@456"
    },
    {
      staffId: "STAFF_NEURO",
      name: "Neurology Staff",
      department: "Neurology",
      password: "neuro@789"
    },
    {
      staffId: "STAFF_ORTHO",
      name: "Orthopedics Staff",
      department: "Orthopedics",
      password: "ortho@101"
    },
    {
      staffId: "STAFF_PEDIA",
      name: "Pediatrics Staff",
      department: "Pediatrics",
      password: "pedia@112"
    },
    {
      staffId: "STAFF_PHARMA",
      name: "Pharmacy Staff",
      department: "Pharmacy",
      password: "pharma@131"
    }
  ],

  // Doctors (2-3 per department)
  doctors: [
    // Cardiology
    {
      doctorId: "DOC_CARDIO_1",
      name: "Dr. Sharma",
      specialization: "Senior Cardiologist",
      department: "Cardiology"
    },
    {
      doctorId: "DOC_CARDIO_2",
      name: "Dr. Patel",
      specialization: "Cardiac Surgeon",
      department: "Cardiology"
    },
    
    // Neurology
    {
      doctorId: "DOC_NEURO_1",
      name: "Dr. Gupta",
      specialization: "Neurologist",
      department: "Neurology"
    },
    {
      doctorId: "DOC_NEURO_2",
      name: "Dr. Khan",
      specialization: "Neurosurgeon",
      department: "Neurology"
    },
    {
      doctorId: "DOC_NEURO_3",
      name: "Dr. Reddy",
      specialization: "Epilepsy Specialist",
      department: "Neurology"
    },
    
    // Orthopedics
    {
      doctorId: "DOC_ORTHO_1",
      name: "Dr. Joshi",
      specialization: "Joint Replacement",
      department: "Orthopedics"
    },
    {
      doctorId: "DOC_ORTHO_2",
      name: "Dr. Malhotra",
      specialization: "Spine Specialist",
      department: "Orthopedics"
    },
    
    // Pediatrics
    {
      doctorId: "DOC_PEDIA_1",
      name: "Dr. Nair",
      specialization: "Child Specialist",
      department: "Pediatrics"
    },
    {
      doctorId: "DOC_PEDIA_2",
      name: "Dr. Kapoor",
      specialization: "Neonatologist",
      department: "Pediatrics"
    },
    
    // Pharmacy (No doctors, only staff)
  ],
}
      // Queue Structure Initialization

  