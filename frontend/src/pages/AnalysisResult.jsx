import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { Leaf, Download, ArrowLeft, AlertCircle, CheckCircle, Lock, Trophy } from 'lucide-react';

const AnalysisResult = () => {
  const navigate = useNavigate();
  const { isTrial } = useAuth();
  const [results, setResults] = useState(null);
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('analysisResults');
    const storedInput = sessionStorage.getItem('analysisInput');
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedInput) {
      setInput(JSON.parse(storedInput));
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (isTrial) {
      setShowLoginModal(true);
      return;
    }

    if (!results?.report_id) {
      setError('PDF download requires login. Please log in and run a new analysis to save reports.');
      return;
    }

    setLoading(true);
    try {
      const response = await reportsAPI.downloadPDF(results.report_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nutriwaste_report_${input?.sample_name || 'sample'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to download PDF. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToHistory = () => {
    if (isTrial) {
      setShowLoginModal(true);
      return;
    }
    // Report is automatically saved for logged-in users
    navigate('/history');
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="skeleton w-12 h-12 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading results...</p>
        </div>
      </div>
    );
  }

  const recommendations = results.recommendations || [];
  const topConfidence = results.top_confidence_pct || 0;
  const ruleApplied = results.rule_applied || '';

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary hover:text-primary-dark mb-4 transition-colors duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50 rounded-lg p-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Analysis Results</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered product recommendations for{' '}
            <span className="font-medium text-primary-dark">{input?.sample_name || 'your sample'}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center animate-shake">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Top Confidence Summary */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 mb-6 hover-card animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12 animate-float">
                <Trophy className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-dark dark:text-dark-text">Top Confidence Score</h2>
                <p className="text-gray-600 dark:text-gray-400">Highest prediction confidence for this sample</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-dark dark:text-dark-text group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">{topConfidence}%</div>
            </div>
          </div>
        </div>

        {/* Rule Applied Badge */}
        <div className="bg-secondary/20 border border-secondary rounded-xl p-6 mb-6 hover-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3">
            <div className="bg-secondary/30 p-2 rounded-full group-hover:bg-secondary/40 transition-colors duration-300">
              <CheckCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-primary-dark dark:text-dark-text">Applied Rule</h3>
              <p className="text-gray-700 dark:text-gray-300">{ruleApplied}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 mb-6 hover-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-secondary/20 p-3 rounded-full group-hover:bg-secondary/30 transition-colors duration-300">
              <Leaf className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-xl font-bold text-primary-dark dark:text-dark-text">Recommended Value-Added Products</h2>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={rec.rank} className="bg-secondary/10 border border-secondary rounded-lg p-5 hover:bg-secondary/20 transition-all duration-200 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    #{rec.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-primary-dark dark:text-dark-text text-lg">{rec.product}</h3>
                      <div className="bg-primary/10 px-3 py-1 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                        <span className="font-semibold text-primary-dark dark:text-dark-text">{rec.confidence_pct}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 hover-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
            >
              {isTrial ? (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Download PDF (Login Required)
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  {loading ? 'Generating...' : 'Download PDF Report'}
                </>
              )}
            </button>

            <button
              onClick={handleSaveToHistory}
              className="flex-1 bg-secondary text-primary-dark py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-primary/50"
            >
              {isTrial ? (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Save to History (Login Required)
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  View in History
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium active:scale-95 focus:ring-2 focus:ring-primary/50"
            >
              Run New Analysis
            </button>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 max-w-md w-full animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary-dark dark:text-dark-text mb-2">Login Required</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This feature is only available for registered users. Create a free account to save reports and download PDFs.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
                >
                  Go to Login / Sign Up
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full border border-gray-300 dark:border-gray-600 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium active:scale-95 focus:ring-2 focus:ring-primary/50"
                >
                  Continue in Trial Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;
