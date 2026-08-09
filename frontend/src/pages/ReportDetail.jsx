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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-dark mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view this report.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-dark mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/history')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to History
          </button>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Report Details</h1>
          <p className="text-gray-600">
            Detailed analysis for <span className="font-medium text-primary-dark">{report.sample_name}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Sample Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-primary-dark mb-4">Sample Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Sample Name</p>
              <p className="font-medium text-primary-dark">{report.sample_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Source Type</p>
              <p className="font-medium text-primary-dark capitalize">{report.source_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Input Method</p>
              <p className="font-medium text-primary-dark capitalize">{report.input_method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Analysis Date</p>
              <p className="font-medium text-primary-dark">
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

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
                    {composition.protein_g_per_100g || report.protein || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Fat</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.fat_g_per_100g || report.fat || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Fibre</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.fibre_g_per_100g || report.fibre || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Carbohydrate</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.carbohydrate_g_per_100g || report.carbohydrate || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Ash</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.ash_g_per_100g || report.ash || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Moisture</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.moisture_g_per_100g || report.moisture || 'N/A'} g/100g
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Energy</td>
                  <td className="py-3 px-4 text-right font-medium text-primary-dark">
                    {composition.energy_kcal_per_100g || report.energy || 'N/A'} kcal/100g
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
              disabled={downloading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
