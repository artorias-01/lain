import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { TopHeader } from './components/Navigation/TopHeader';
import { MainTrackView } from './components/Player/MainTrackView';
import { SpotifyPlayerBar } from './components/Player/SpotifyPlayerBar';
import { ExpandedNowPlaying } from './components/Player/ExpandedNowPlaying';
import { initLenisInstance } from './lib/lenis';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'radio' | 'audio-lab' | 'liked' | 'playlists'>('home');

  useEffect(() => {
    // Initialize Lenis smooth scroll synced to GSAP ticker
    const lenis = initLenisInstance();
    return () => {
      lenis?.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md text-body-md antialiased selection:bg-primary selection:text-surface-dim">
      {/* 1. Fixed Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* 2. Main Content Container (offset by sidebar width and player height) */}
      <div className="pl-gutter-sidebar pb-player-height">
        {/* Fixed Top Header */}
        <TopHeader />

        {/* Dynamic Main Track & Dashboard Views */}
        <MainTrackView />
      </div>

      {/* 3. Fixed Bottom Lossless Player Bar */}
      <SpotifyPlayerBar />

      {/* 4. Full-screen Expandable Now Playing View & Lyrics */}
      <ExpandedNowPlaying />
    </div>
  );
};

export default App;
