import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Trial from './pages/Trial';
import Dashboard from './pages/Dashboard';
import ManualAnalysis from './pages/ManualAnalysis';
import ImageAnalysis from './pages/ImageAnalysis';
import AnalysisResult from './pages/AnalysisResult';
import History from './pages/History';
import ReportDetail from './pages/ReportDetail';

function AppContent() {
  const location = useLocation();
  const showNavbar = !['/', '/login', '/trial'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trial" element={<Trial />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis/manual" element={<ManualAnalysis />} />
        <Route path="/analysis/image" element={<ImageAnalysis />} />
        <Route path="/analysis/result" element={<AnalysisResult />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<ReportDetail />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
