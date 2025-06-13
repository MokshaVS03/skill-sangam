import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [ots, setOts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // Initialize socket connection
  useEffect(() => {
    // Connect to the server with Socket.io
    const newSocket = io(import.meta.env.DEV ? 'http://localhost:5000' : '/');
    
    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });
    
    newSocket.on('data-update', (data) => {
      if (data.doctors) setDoctors(data.doctors);
      if (data.ots) setOts(data.ots);
    });
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);
  
  // Show notification
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ message, severity });
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  }, []);
  
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard');
      setDoctors(response.data.doctors);
      setOts(response.data.ots);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
      showNotification('Failed to load dashboard data', 'error');
    }
  }, [showNotification]);
  
  // Schedule a surgery
  const scheduleSurgery = useCallback(async (patientInfo, duration) => {
    try {
      const response = await axios.post('/api/schedule', { patientInfo, duration });
      showNotification(response.data.message, 'success');
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to schedule surgery';
      showNotification(errorMsg, 'error');
      console.error('Error scheduling surgery:', err);
      return { success: false, message: errorMsg };
    }
  }, [showNotification]);
  
  // Handle emergency case
  const handleEmergency = useCallback(async (patientInfo) => {
    try {
      const response = await axios.post('/api/emergency', { patientInfo });
      showNotification(response.data.message, 'warning');
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to handle emergency';
      showNotification(errorMsg, 'error');
      console.error('Error handling emergency:', err);
      return { success: false, message: errorMsg };
    }
  }, [showNotification]);
  
  // Get free OTs
  const getFreeOTs = useCallback(() => {
    return ots.filter(ot => ot.status === 'free');
  }, [ots]);
  
  // Get occupied OTs
  const getOccupiedOTs = useCallback(() => {
    return ots.filter(ot => ot.status === 'occupied');
  }, [ots]);
  
  // Get available doctors
  const getAvailableDoctors = useCallback(() => {
    return doctors.filter(doctor => doctor.status === 'free');
  }, [doctors]);
  
  const value = {
    doctors,
    ots,
    loading,
    error,
    notification,
    fetchDashboardData,
    scheduleSurgery,
    handleEmergency,
    showNotification,
    getFreeOTs,
    getOccupiedOTs,
    getAvailableDoctors
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};