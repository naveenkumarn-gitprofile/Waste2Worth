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
    <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="skeleton w-12 h-12 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">Starting trial mode...</p>
      </div>
    </div>
  );
};

export default Trial;
