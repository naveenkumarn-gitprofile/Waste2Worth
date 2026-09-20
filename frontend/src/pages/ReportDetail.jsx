import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { Leaf, Download, ArrowLeft, AlertCircle, BarChart3, CheckCircle, Loader2 } from 'lucide-react';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getById(id);
      setReport(response.data);
    } catch (err) {
      setError('Failed to load report. It may not exist or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await reportsAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nutriwaste_report_${report?.sample_name || 'sample'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-primary-dark mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view this report.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="skeleton w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-primary-dark mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const composition = report.composition || {};
  const recommendations = report.recommended_products || [];

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center text-primary hover:text-primary-dark mb-4 transition-colors duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50 rounded-lg p-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to History
          </button>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Report Details</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed analysis for <span className="font-medium text-primary-dark">{report.sample_name}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center animate-shake">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Sample Information */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 mb-6 hover-card animate-fade-in-up">
          <h2 className="text-xl font-bold text-primary-dark dark:text-dark-text mb-4">Sample Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sample Name</p>
              <p className="font-medium text-primary-dark dark:text-dark-text">{report.sample_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Source Type</p>
              <p className="font-medium text-primary-dark dark:text-dark-text capitalize">{report.source_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Input Method</p>
              <p className="font-medium text-primary-dark dark:text-dark-text capitalize">{report.input_method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Analysis Date</p>
              <p className="font-medium text-primary-dark dark:text-dark-text">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Nutritional & Bioactive Composition */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 mb-6 hover-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
              <BarChart3 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-xl font-bold text-primary-dark dark:text-dark-text">Nutritional & Bioactive Composition</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 text-primary-dark dark:text-dark-text font-semibold">Parameter</th>
                  <th className="text-right py-3 px-4 text-primary-dark dark:text-dark-text font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Moisture</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.moisture || report.moisture || 'N/A'} %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Ash</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.ash || report.ash || 'N/A'} %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Protein</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.protein || report.protein || 'N/A'} %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Fat</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.fat || report.fat || 'N/A'} %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Crude Fiber</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.crude_fiber || report.crude_fiber || 'N/A'} %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Carbohydrate</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.carbohydrate || report.carbohydrate || 'N/A'} %
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Total Phenolics</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.total_phenolics || report.total_phenolics || 'N/A'} mg GAE/g
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Total Flavonoids</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.total_flavonoids || report.total_flavonoids || 'N/A'} mg QE/g
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">DPPH Inhibition</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark dark:text-dark-text">
                    {composition.dpph || report.dpph || 'N/A'} %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {composition.fruit_type && (
            <div className="mt-6 p-4 bg-background dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Fruit Peel Type:</strong> {composition.fruit_type}
              </p>
            </div>
          )}
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
              disabled={downloading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF Report
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/history')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium active:scale-95 focus:ring-2 focus:ring-primary/50"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
