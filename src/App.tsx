import React, { useEffect } from 'react';
import { MainTrackView } from './components/Player/MainTrackView';
import { SpotifyPlayerBar } from './components/Player/SpotifyPlayerBar';
import { ExpandedNowPlaying } from './components/Player/ExpandedNowPlaying';
import { initLenisInstance } from './lib/lenis';

export const App: React.FC = () => {
  useEffect(() => {
    // Initialize Lenis smooth scroll synced to GSAP ticker
    const lenis = initLenisInstance();
    return () => {
      lenis?.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-lacquer text-paper font-sans selection:bg-ochre selection:text-lacquer relative">
      {/* Editorial Catalog View */}
      <MainTrackView />

      {/* Fixed Flush-Rule Now-Playing Bar */}
      <SpotifyPlayerBar />

      {/* Full-screen Expandable Now Playing View with Synchronized Vinyl */}
      <ExpandedNowPlaying />
    </div>
  );
};

export default App;
