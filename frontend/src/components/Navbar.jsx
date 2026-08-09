import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User, Home, History, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, isTrial, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-secondary" />
            <span className="text-xl font-bold">NutriWasteAI</span>
          </Link>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 hover:text-secondary-light transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              
              {!isTrial && (
                <Link
                  to="/history"
                  className="flex items-center space-x-1 hover:text-secondary-light transition-colors"
                >
                  <History className="h-5 w-5" />
                  <span className="hidden sm:inline">History</span>
                </Link>
              )}

              <div className="flex items-center space-x-2 border-l border-secondary-light pl-4">
                {user ? (
                  <>
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{user.name || user.email}</span>
                  </>
                ) : (
                  <span className="text-secondary-light">Trial Mode</span>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-secondary-light transition-colors ml-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-accent text-primary-dark rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {isTrial && (
        <div className="bg-accent text-primary-dark px-4 py-2 text-center text-sm font-medium">
          🌱 You're in Trial Mode — Login to save your reports and download PDFs
        </div>
      )}
    </nav>
  );
};

export default Navbar;
