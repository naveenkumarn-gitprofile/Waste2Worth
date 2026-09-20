import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ChatWidget from './ChatWidget';
import { Leaf, LogOut, User, Home, History, FileText, Sun, Moon, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const { user, isTrial, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-primary-dark text-white shadow-lg backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-secondary/20 p-2 rounded-full group-hover:bg-secondary/30 transition-all duration-300 animate-float">
                <Leaf className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-xl font-bold group-hover:text-secondary-light transition-colors duration-300">NutriWasteAI</span>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-primary-light transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="h-5 w-5 hover:scale-110 transition-transform duration-200" /> : <Moon className="h-5 w-5 hover:scale-110 transition-transform duration-200" />}
              </button>

              {/* Enquiry Agent */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50 ${showChat ? 'bg-primary-light' : 'hover:bg-primary-light'}`}
                title="Enquiry Agent"
                aria-label="Open Enquiry Agent"
                aria-expanded={showChat}
              >
                <MessageCircle className="h-5 w-5 hover:scale-110 transition-transform duration-200" />
              </button>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-light transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50"
                  >
                    <Home className="h-5 w-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  
                  {!isTrial && (
                    <Link
                      to="/history"
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-light transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50"
                    >
                      <History className="h-5 w-5" />
                      <span className="hidden sm:inline">History</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2 border-l border-secondary-light pl-4">
                    {user ? (
                      <>
                        <div className="bg-secondary/20 p-1.5 rounded-full">
                          <User className="h-5 w-5 text-secondary" />
                        </div>
                        <span className="hidden sm:inline font-medium">{user.name || user.email}</span>
                      </>
                    ) : (
                      <span className="text-secondary-light font-medium">Trial Mode</span>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-light transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg hover:bg-primary-light transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-accent text-primary-dark rounded-lg hover:bg-amber-600 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-secondary/50 font-medium shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {isTrial && (
          <div className="bg-accent text-primary-dark px-4 py-2 text-center text-sm font-medium animate-pulse">
            🌱 You're in Trial Mode — Login to save your reports and download PDFs
          </div>
        )}
      </nav>
      <ChatWidget isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  );
};

export default Navbar;
