const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const moment = require('moment');

// Routes
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data files if they don't exist
const initializeData = () => {
  const dataDir = path.join(__dirname, 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  const doctorsPath = path.join(dataDir, 'doctors.json');
  const otsPath = path.join(dataDir, 'ots.json');
  
  if (!fs.existsSync(doctorsPath)) {
    const doctors = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Dr. ${['Smith', 'Johnson', 'Lee', 'Patel', 'Garcia', 'Kim', 'Wong', 'Martinez', 'Brown', 'Davis', 'Wilson', 'Taylor'][i]}`,
      specialty: ['Cardiology', 'Neurosurgery', 'Orthopedics', 'General', 'Vascular', 'ENT', 'Urology', 'Pediatric', 'Plastic', 'Thoracic', 'Trauma', 'Oncology'][i],
      status: i < 8 ? 'free' : (i < 10 ? 'assigned' : 'on-call')
    }));
    fs.writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2));
  }
  
  if (!fs.existsSync(otsPath)) {
    const ots = Array.from({ length: 10 }, (_, i) => {
      const isOccupied = i < 4;
      return {
        id: i + 1,
        name: `OT-${i + 1}`,
        status: isOccupied ? 'occupied' : 'free',
        isEmergencyOT: i === 9,
        freeAt: isOccupied ? moment().add(Math.floor(Math.random() * 3) + 1, 'hours').format() : null,
        patientInfo: isOccupied ? {
          id: `P${1000 + i}`,
          name: `Patient ${1000 + i}`,
          token: `TKN${1000 + i}`,
          procedure: ['Appendectomy', 'Bypass', 'Hip Replacement', 'Cataract Removal'][i % 4],
          urgency: ['normal', 'urgent', 'high', 'normal'][i % 4],
          startTime: moment().subtract(Math.floor(Math.random() * 60) + 30, 'minutes').format()
        } : null,
        doctorId: isOccupied ? i + 1 : null
      };
    });
    fs.writeFileSync(otsPath, JSON.stringify(ots, null, 2));
  }
};

initializeData();

// Set up Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Emit initial data
  const emitLatestData = () => {
    try {
      const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'doctors.json')));
      const ots = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ots.json')));
      socket.emit('data-update', { doctors, ots });
    } catch (error) {
      console.error('Error reading data files:', error);
    }
  };
  
  emitLatestData();
  
  // Set up real-time OT updates
  const checkOtStatus = () => {
    try {
      const otsPath = path.join(__dirname, 'data', 'ots.json');
      const doctorsPath = path.join(__dirname, 'data', 'doctors.json');
      
      let ots = JSON.parse(fs.readFileSync(otsPath));
      let doctors = JSON.parse(fs.readFileSync(doctorsPath));
      let updated = false;
      
      // Check if any OTs should be free now
      const now = moment();
      ots.forEach(ot => {
        if (ot.status === 'occupied' && ot.freeAt && moment(ot.freeAt).isBefore(now)) {
          // Free up the OT
          ot.status = 'free';
          ot.freeAt = null;
          
          // Free up the doctor
          if (ot.doctorId) {
            const doctor = doctors.find(d => d.id === ot.doctorId);
            if (doctor) {
              doctor.status = 'free';
            }
            ot.doctorId = null;
          }
          
          // Clear patient info
          ot.patientInfo = null;
          updated = true;
        }
      });
      
      if (updated) {
        fs.writeFileSync(otsPath, JSON.stringify(ots, null, 2));
        fs.writeFileSync(doctorsPath, JSON.stringify(doctors, null, 2));
        io.emit('data-update', { doctors, ots });
      }
    } catch (error) {
      console.error('Error updating OT status:', error);
    }
  };
  
  // Check OT status every 10 seconds
  const interval = setInterval(checkOtStatus, 10000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// API Routes
app.use('/api', apiRoutes(io));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));