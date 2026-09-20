import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, BarChart3, Leaf } from 'lucide-react';

const Dashboard = () => {
  const { user, isTrial } = useAuth();
  const [analysisCount, setAnalysisCount] = useState('-');
  const [recentReport, setRecentReport] = useState(null);

  useEffect(() => {
    if (!isTrial && user) {
      fetchAnalysisCount();
      fetchRecentReport();
    } else {
      setAnalysisCount('0');
    }
  }, [isTrial, user]);

  const fetchAnalysisCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/reports/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching analysis count:', error);
    }
  };

  const fetchRecentReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/reports/?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setRecentReport(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching recent report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isTrial 
              ? 'You are in trial mode. Create an account to save your reports and access full features.'
              : 'Ready to analyze your food waste samples?'
            }
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border-l-4 border-primary hover-card group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Analyses</p>
                <p className="text-3xl font-bold text-primary-dark dark:text-dark-text mt-1 group-hover:scale-110 transition-transform duration-300">{analysisCount}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border-l-4 border-secondary hover-card group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Most Recent</p>
                <p className="text-lg font-bold text-primary-dark dark:text-dark-text mt-1 group-hover:scale-110 transition-transform duration-300">
                  {recentReport ? recentReport.sample_name : 'No reports yet'}
                </p>
                {recentReport && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(recentReport.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="bg-secondary/20 p-3 rounded-full group-hover:bg-secondary/30 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border-l-4 border-accent hover-card group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Account Type</p>
                <p className="text-lg font-bold text-primary-dark dark:text-dark-text mt-1 group-hover:scale-110 transition-transform duration-300">
                  {isTrial ? 'Trial Mode' : 'Full Access'}
                </p>
              </div>
              <div className="bg-accent/20 p-3 rounded-full group-hover:bg-accent/30 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-1 gap-6 mb-8">
          <Link
            to="/analysis/manual"
            className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary group hover-card"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark dark:text-dark-text mb-1">
                  New Analysis — Manual Entry
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter sample details manually for nutritional analysis
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        {!isTrial && (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 hover-card">
            <h3 className="text-lg font-bold text-primary-dark mb-4">Quick Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/history"
                className="flex items-center space-x-3 p-4 rounded-lg bg-background dark:bg-dark-bg hover:bg-secondary/20 transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary-dark">View Analysis History</span>
              </Link>
            </div>
          </div>
        )}

        {isTrial && (
          <div className="bg-secondary/20 rounded-xl p-6 border border-secondary hover-card">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-2 rounded-full mt-1">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary-dark mb-2">Trial Mode Features</h3>
                <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                  <li>✓ Run unlimited analyses</li>
                  <li>✓ View nutritional composition</li>
                  <li>✓ Get product recommendations</li>
                  <li className="text-gray-500 dark:text-gray-500">✗ Save reports to history</li>
                  <li className="text-gray-500 dark:text-gray-500">✗ Download PDF reports</li>
                </ul>
                <Link
                  to="/login"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
