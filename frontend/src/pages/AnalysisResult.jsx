import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { Leaf, Download, ArrowLeft, AlertCircle, BarChart3, CheckCircle, Lock } from 'lucide-react';

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
      setError('Report not saved. Unable to download PDF.');
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
      setError('Failed to download PDF. Please try again.');
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const composition = results.composition || {};
  const recommendations = results.recommendations || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Analysis Results</h1>
          <p className="text-gray-600">
            Nutritional composition and value-added product recommendations for{' '}
            <span className="font-medium text-primary-dark">{input?.sample_name || 'your sample'}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Nutrient Composition */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-primary-dark">Nutritional Composition</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 text-primary-dark font-semibold">Nutrient</th>
                  <th className="text-right py-3 px-4 text-primary-dark font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Protein</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.protein_g_per_100g || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Fat</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.fat_g_per_100g || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Fibre</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.fibre_g_per_100g || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Carbohydrate</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.carbohydrate_g_per_100g || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Ash</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.ash_g_per_100g || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Moisture</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.moisture_g_per_100g || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Energy</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.energy_kcal_per_100g || 'N/A'} kcal/100g
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {composition.source_reference && (
            <div className="mt-6 p-4 bg-background rounded-lg">
              <p className="text-sm text-gray-600 italic">
                <strong>Source Reference:</strong> {composition.source_reference}
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-secondary/20 p-3 rounded-full">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-primary-dark">Recommended Value-Added Products</h2>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-secondary/10 border border-secondary rounded-lg p-5">
                <div className="flex items-start space-x-3">
                  <div className="bg-secondary/30 p-2 rounded-full mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-primary-dark mb-2">{rec.product}</h3>
                    <p className="text-gray-700">{rec.rationale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="flex-1 bg-secondary text-primary-dark py-3 rounded-lg hover:bg-secondary-light transition-colors font-medium flex items-center justify-center"
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
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Run New Analysis
            </button>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary-dark mb-2">Login Required</h3>
                <p className="text-gray-600">
                  This feature is only available for registered users. Create a free account to save reports and download PDFs.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Go to Login / Sign Up
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
