import React from 'react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-accent/20 text-accent text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          Flippy Studio beta is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          The Next-Gen <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-300 drop-shadow-sm">
            Design Environment
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Experience a minimal, game-focused studio equipped with powerful AI models perfectly suited for forward-thinking creators and teams.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/login" 
            className="w-full sm:w-auto glow-button px-8 py-4 text-lg"
          >
            Start Designing Free
          </Link>
          <a 
            href="#demo" 
            className="w-full sm:w-auto glass-button px-8 py-4 text-lg text-white"
          >
            View Demo
          </a>
        </div>
        
        {/* Mockup Preview */}
        <div className="mt-20 relative mx-auto w-full max-w-4xl rounded-2xl glass-panel p-2 shadow-glow-strong">
          <div className="aspect-[16/9] w-full bg-dark/80 rounded-xl overflow-hidden relative">
            {/* Mockup UI Hint */}
            <div className="absolute top-0 w-full h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="absolute inset-x-0 top-8 bottom-0 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/30 shadow-glow">
                <span className="text-accent text-2xl font-bold">F</span>
              </div>
              <div className="text-gray-500 font-medium">Interactive Canvas Area</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
