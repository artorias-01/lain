import React, { useEffect } from 'react';
import { HeroSection } from './components/Hero/HeroSection';
import { PlayerSection } from './components/Player/PlayerSection';
import { TrackListSection } from './components/TrackList/TrackListSection';
import { AboutSection } from './components/About/AboutSection';
import { initLenisInstance } from './lib/lenis';

export const App: React.FC = () => {
  useEffect(() => {
    // Initialize Lenis inertial smooth scroll provider synced with GSAP ticker
    const lenis = initLenisInstance();

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative selection:bg-accent selection:text-black">
      <HeroSection />
      <PlayerSection />
      <TrackListSection />
      <AboutSection />
    </div>
  );
};

export default App;
