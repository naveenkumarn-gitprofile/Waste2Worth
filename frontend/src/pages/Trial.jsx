import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Trial = () => {
  const { startTrial } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    startTrial();
    navigate('/dashboard');
  }, [startTrial, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Starting trial mode...</p>
      </div>
    </div>
  );
};

export default Trial;
