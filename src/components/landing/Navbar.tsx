import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 glass-panel border-x-0 border-t-0 rounded-none bg-dark/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xl leading-none">F</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Flippy Studio
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link to="/" className="text-white hover:text-accent transition-colors">Home</Link>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#ai-models" className="hover:text-white transition-colors">AI Models</a>
          <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
          <a href="#resources" className="hover:text-white transition-colors">Resources</a>
        </div>

        {/* CTA */}
        <div>
          <Link 
            to="/login"
            className="glow-button px-6 py-2.5 text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
