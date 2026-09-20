import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { Leaf, AlertCircle, Loader2 } from 'lucide-react';

const ManualAnalysis = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sample_name: '',
    source_type: '',
    fruit_type: 'Banana Peel',
    moisture: '',
    ash: '',
    protein: '',
    fat: '',
    crude_fiber: '',
    carbohydrate: '',
    total_phenolics: '',
    total_flavonoids: '',
    dpph: '',
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
        fruit_type: formData.fruit_type,
        moisture: parseFloat(formData.moisture) || 0.0,
        ash: parseFloat(formData.ash) || 0.0,
        protein: parseFloat(formData.protein) || 0.0,
        fat: parseFloat(formData.fat) || 0.0,
        crude_fiber: parseFloat(formData.crude_fiber) || 0.0,
        carbohydrate: parseFloat(formData.carbohydrate) || 0.0,
        total_phenolics: parseFloat(formData.total_phenolics) || 0.0,
        total_flavonoids: parseFloat(formData.total_flavonoids) || 0.0,
        dpph: parseFloat(formData.dpph) || 0.0,
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
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-primary-dark mb-2">Manual Entry Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your food waste sample details for AI-powered product recommendation
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 animate-fade-in-up">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center animate-shake">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sample Name *
                </label>
                <input
                  type="text"
                  name="sample_name"
                  value={formData.sample_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                  placeholder="e.g., Banana Peel Sample"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source Type *
                </label>
                <select
                  name="source_type"
                  value={formData.source_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text"
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

            {/* ML Model Parameters */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-2 mb-4 group">
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary-dark dark:text-dark-text group-hover:translate-x-1 transition-transform duration-300">
                  Nutritional & Bioactive Parameters
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter the measured laboratory values for your sample
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fruit Peel Type *
                  </label>
                  <select
                    name="fruit_type"
                    value={formData.fruit_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text"
                  >
                    <option value="Banana Peel">Banana Peel</option>
                    <option value="Mango Peel">Mango Peel</option>
                    <option value="Papaya Peel">Papaya Peel</option>
                    <option value="Citrus Peel">Citrus Peel (Lime/Mosambi/Orange)</option>
                    <option value="Guava Peel">Guava Peel</option>
                    <option value="Pomegranate Peel">Pomegranate Peel</option>
                    <option value="Pineapple Peel">Pineapple Peel</option>
                    <option value="Watermelon Rind">Watermelon Rind</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moisture (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="moisture"
                    value={formData.moisture}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ash (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="ash"
                    value={formData.ash}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Protein (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fat (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crude Fiber (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="crude_fiber"
                    value={formData.crude_fiber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Carbohydrate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="carbohydrate"
                    value={formData.carbohydrate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Phenolics (mg GAE/g) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_phenolics"
                    value={formData.total_phenolics}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Flavonoids (mg QE/g) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_flavonoids"
                    value={formData.total_flavonoids}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    DPPH Inhibition (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="dpph"
                    value={formData.dpph}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:bg-dark-bg dark:text-dark-text placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50"
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
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium active:scale-95 focus:ring-2 focus:ring-primary/50"
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
