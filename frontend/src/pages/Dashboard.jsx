import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Camera, FileText, BarChart3, Leaf } from 'lucide-react';

const Dashboard = () => {
  const { user, isTrial } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-gray-600">
            {isTrial 
              ? 'You are in trial mode. Create an account to save your reports and access full features.'
              : 'Ready to analyze your food waste samples?'
            }
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Analyses</p>
                <p className="text-3xl font-bold text-primary-dark mt-1">-</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Most Recent</p>
                <p className="text-lg font-bold text-primary-dark mt-1">No reports yet</p>
              </div>
              <div className="bg-secondary/20 p-3 rounded-full">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Account Type</p>
                <p className="text-lg font-bold text-primary-dark mt-1">
                  {isTrial ? 'Trial Mode' : 'Full Access'}
                </p>
              </div>
              <div className="bg-accent/20 p-3 rounded-full">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/analysis/manual"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-1">
                  New Analysis — Manual Entry
                </h3>
                <p className="text-gray-600">
                  Enter sample details manually for nutritional analysis
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/analysis/image"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                <Camera className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark mb-1">
                  New Analysis — Capture Image
                </h3>
                <p className="text-gray-600">
                  Take or upload a photo of your waste sample
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        {!isTrial && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-primary-dark mb-4">Quick Links</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/history"
                className="flex items-center space-x-3 p-4 rounded-lg bg-background hover:bg-secondary/20 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary-dark">View Analysis History</span>
              </Link>
            </div>
          </div>
        )}

        {isTrial && (
          <div className="bg-secondary/20 rounded-xl p-6 border border-secondary">
            <div className="flex items-start space-x-4">
              <Leaf className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-bold text-primary-dark mb-2">Trial Mode Features</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>✓ Run unlimited analyses</li>
                  <li>✓ View nutritional composition</li>
                  <li>✓ Get product recommendations</li>
                  <li className="text-gray-500">✗ Save reports to history</li>
                  <li className="text-gray-500">✗ Download PDF reports</li>
                </ul>
                <Link
                  to="/login"
                  className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
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
