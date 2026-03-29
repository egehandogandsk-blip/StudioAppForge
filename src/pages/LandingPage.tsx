import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark text-white relative">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
};
