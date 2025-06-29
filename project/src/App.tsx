import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout Components
import Navigation from './components/Layout/Navigation';

// Patient Components
import PatientDashboard from './components/Patient/PatientDashboard';
import BookAppointment from './components/Patient/BookAppointment';
import ViewPrescriptions from './components/Patient/ViewPrescriptions';
import PatientFeedback from './components/Patient/PatientFeedback';

// Doctor Components
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import ManageAppointments from './components/Doctor/ManageAppointments';
import DoctorPrescriptions from './components/Doctor/DoctorPrescriptions';
import DoctorFeedback from './components/Doctor/DoctorFeedback';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {currentUser && <Navigation />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute requiredRole="patient">
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute requiredRole="patient">
                <ViewPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/feedback"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientFeedback />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute requiredRole="doctor">
                <ManageAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/feedback"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorFeedback />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;