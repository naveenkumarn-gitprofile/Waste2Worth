import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { FileText, Download, Search, Calendar, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = reports.filter(
        (report) =>
          report.sample_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.source_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    } else {
      setFilteredReports(reports);
    }
  }, [searchTerm, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getAll();
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (reportId, sampleName) => {
    try {
      const response = await reportsAPI.downloadPDF(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nutriwaste_report_${sampleName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF. Please try again.');
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/history/${reportId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-primary-dark mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view your analysis history.</p>
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

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-primary hover:text-primary-dark mb-4 transition-colors duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50 rounded-lg p-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Analysis History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your past food waste analyses
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center animate-shake">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mb-6 hover-card animate-fade-in-up">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by sample name or source type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden hover-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="skeleton w-8 h-8 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No reports found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'Try a different search term' : 'Start by running your first analysis'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/analysis/manual')}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
                >
                  Run New Analysis
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background dark:bg-dark-bg">
                  <tr>
                    <th className="text-left py-4 px-6 text-primary-dark dark:text-dark-text font-semibold">Sample Name</th>
                    <th className="text-left py-4 px-6 text-primary-dark dark:text-dark-text font-semibold">Source Type</th>
                    <th className="text-left py-4 px-6 text-primary-dark dark:text-dark-text font-semibold">Method</th>
                    <th className="text-left py-4 px-6 text-primary-dark dark:text-dark-text font-semibold">Date</th>
                    <th className="text-right py-4 px-6 text-primary-dark dark:text-dark-text font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr key={report.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="py-4 px-6">
                        <div className="font-medium text-primary-dark dark:text-dark-text">{report.sample_name}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400 capitalize">{report.source_type}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-secondary/20 text-primary-dark rounded-full text-sm capitalize">
                          {report.input_method}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50"
                            title="View Details"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(report.id, report.sample_name)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-primary/50"
                            title="Download PDF"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
