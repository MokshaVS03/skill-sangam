const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { scheduleSurgery } = require('../controllers/surgeryController');
const { handleEmergency } = require('../controllers/emergencyController');

module.exports = (io) => {
  const router = express.Router();
  
  // Get all doctors
  router.get('/doctors', (req, res) => {
    try {
      const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/doctors.json')));
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get all OTs
  router.get('/ots', (req, res) => {
    try {
      const ots = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ots.json')));
      res.json(ots);
    } catch (error) {
      console.error('Error fetching OTs:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get dashboard data (combined doctors and OTs)
  router.get('/dashboard', (req, res) => {
    try {
      const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/doctors.json')));
      const ots = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ots.json')));
      
      res.json({ doctors, ots });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Schedule a surgery
  router.post('/schedule', (req, res) => {
    try {
      const { patientInfo, duration } = req.body;
      
      if (!patientInfo || !duration) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const result = scheduleSurgery(patientInfo, duration);
      
      if (result.success) {
        // Emit updated data to all clients
        const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/doctors.json')));
        const ots = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ots.json')));
        io.emit('data-update', { doctors, ots });
        
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error scheduling surgery:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Handle emergency case
  router.post('/emergency', (req, res) => {
    try {
      const { patientInfo } = req.body;
      
      if (!patientInfo) {
        return res.status(400).json({ message: 'Missing patient information' });
      }
      
      const result = handleEmergency(patientInfo);
      
      if (result.success) {
        // Emit updated data to all clients
        const doctors = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/doctors.json')));
        const ots = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ots.json')));
        io.emit('data-update', { doctors, ots });
        
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error handling emergency:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return router;
};