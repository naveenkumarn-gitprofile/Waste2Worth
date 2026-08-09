import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { Leaf, AlertCircle, Loader2 } from 'lucide-react';

const ManualAnalysis = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sample_name: '',
    source_type: '',
    protein: '',
    fat: '',
    fibre: '',
    carbohydrate: '',
    ash: '',
    moisture: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        sample_name: formData.sample_name,
        source_type: formData.source_type,
        protein: formData.protein ? parseFloat(formData.protein) : null,
        fat: formData.fat ? parseFloat(formData.fat) : null,
        fibre: formData.fibre ? parseFloat(formData.fibre) : null,
        carbohydrate: formData.carbohydrate ? parseFloat(formData.carbohydrate) : null,
        ash: formData.ash ? parseFloat(formData.ash) : null,
        moisture: formData.moisture ? parseFloat(formData.moisture) : null,
      };

      const response = await analysisAPI.manual(payload);
      
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('analysisResults', JSON.stringify(response.data));
      sessionStorage.setItem('analysisInput', JSON.stringify(formData));
      
      navigate('/analysis/result');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Manual Entry Analysis</h1>
          <p className="text-gray-600">
            Enter your food waste sample details for nutritional composition analysis
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Name *
                </label>
                <input
                  type="text"
                  name="sample_name"
                  value={formData.sample_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Banana Peel Flour"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type *
                </label>
                <select
                  name="source_type"
                  value={formData.source_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select source type</option>
                  <option value="fruit peel">Fruit Peel</option>
                  <option value="vegetable residue">Vegetable Residue</option>
                  <option value="whey">Whey</option>
                  <option value="oilseed cake">Oilseed Cake</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Optional Nutrient Fields */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-primary-dark">
                  Optional Nutrient Values (g/100g)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Leave blank if unknown — the AI will estimate these values
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protein
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fibre
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="fibre"
                    value={formData.fibre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carbohydrate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="carbohydrate"
                    value={formData.carbohydrate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ash
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="ash"
                    value={formData.ash}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moisture
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="moisture"
                    value={formData.moisture}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Run Analysis'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualAnalysis;
