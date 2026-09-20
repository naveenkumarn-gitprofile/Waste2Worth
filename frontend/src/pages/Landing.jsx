import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, Beaker, FileText, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white dark:from-primary-dark dark:via-primary dark:to-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-secondary/20 p-4 rounded-full animate-float hover:animate-none transition-all duration-300 group">
                <Leaf className="h-16 w-16 text-secondary hover:scale-110 transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up animate-pulse-slow">
              Transform Food Waste into Value
            </h1>
            <p className="text-xl md:text-2xl text-secondary-light mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              AI-powered platform for food-waste valorization, nutritional assessment, and value-added product recommendation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link
                to="/login"
                className="px-8 py-4 bg-accent text-primary-dark rounded-lg hover:bg-amber-600 transition-all duration-300 font-bold text-lg flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 focus:ring-2 focus:ring-secondary/50 ripple-effect magnetic-button"
              >
                Login / Sign Up
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button
                onClick={() => window.location.href = '/trial'}
                className="px-8 py-4 bg-secondary text-primary-dark rounded-lg hover:bg-secondary-light transition-all duration-300 font-bold text-lg shadow-md hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-secondary/50 ripple-effect magnetic-button"
              >
                Try Without Login (Free Trial)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SDGs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-primary-dark text-center mb-12 animate-fade-in-up">
          Supporting UN Sustainable Development Goals
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg border-l-4 border-primary hover-card group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <h3 className="text-xl font-bold text-primary-dark dark:text-dark-text mb-2">SDG 2</h3>
            <p className="text-gray-600 dark:text-gray-400">Zero Hunger - Promoting sustainable food production and reducing food waste</p>
          </div>
          
          <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg border-l-4 border-primary hover-card group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
              <Beaker className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <h3 className="text-xl font-bold text-primary-dark dark:text-dark-text mb-2">SDG 9</h3>
            <p className="text-gray-600 dark:text-gray-400">Industry, Innovation and Infrastructure - Fostering sustainable industrialization</p>
          </div>
          
          <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg border-l-4 border-primary hover-card group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300">
              <Recycle className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <h3 className="text-xl font-bold text-primary-dark dark:text-dark-text mb-2">SDG 12</h3>
            <p className="text-gray-600 dark:text-gray-400">Responsible Consumption and Production - Ensuring sustainable consumption patterns</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-dark-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-dark dark:text-dark-text text-center mb-12 animate-fade-in-up">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-secondary/30 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:animate-bounce">
                <span className="text-2xl font-bold text-primary-dark">1</span>
              </div>
              <h3 className="font-bold text-primary-dark dark:text-dark-text mb-2 group-hover:translate-y-1 transition-transform duration-300">Input Sample</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Enter details manually or capture an image of your food waste sample</p>
            </div>
            
            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-secondary/30 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:animate-bounce" style={{ animationDelay: '0.1s' }}>
                <span className="text-2xl font-bold text-primary-dark dark:text-dark-text">2</span>
              </div>
              <h3 className="font-bold text-primary-dark dark:text-dark-text mb-2 group-hover:translate-y-1 transition-transform duration-300">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Our AI analyzes the nutritional composition and potential applications</p>
            </div>
            
            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-secondary/30 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:animate-bounce" style={{ animationDelay: '0.2s' }}>
                <span className="text-2xl font-bold text-primary-dark dark:text-dark-text">3</span>
              </div>
              <h3 className="font-bold text-primary-dark dark:text-dark-text mb-2 group-hover:translate-y-1 transition-transform duration-300">Get Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Receive tailored value-added product suggestions with justifications</p>
            </div>
            
            <div className="text-center group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4 group-hover:bg-secondary/30 transition-colors duration-300 group-hover:scale-110 transition-transform duration-300 group-hover:animate-bounce" style={{ animationDelay: '0.3s' }}>
                <span className="text-2xl font-bold text-primary-dark dark:text-dark-text">4</span>
              </div>
              <h3 className="font-bold text-primary-dark dark:text-dark-text mb-2 group-hover:translate-y-1 transition-transform duration-300">Export & Save</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Download detailed PDF reports and track your analysis history</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-dark text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Food Waste?</h2>
          <p className="text-xl text-secondary-light mb-8 opacity-90">
            Join thousands of researchers and innovators working towards a sustainable future
          </p>
          <Link
            to="/login"
            className="px-8 py-4 bg-accent text-primary-dark rounded-lg hover:bg-amber-600 transition-all duration-300 font-bold text-lg inline-flex items-center shadow-lg hover:shadow-xl active:scale-95 focus:ring-2 focus:ring-secondary/50"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 NutriWasteAI. Contributing to UN Sustainable Development Goals 2, 9, and 12.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
