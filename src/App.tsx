import React, { useEffect } from 'react';
import { Sidebar } from './components/Spotify/Sidebar';
import { TopNav } from './components/Spotify/TopNav';
import { SearchResults } from './components/Spotify/SearchResults';
import { SpotifyPlayer } from './components/Spotify/SpotifyPlayer';
import { TurntableDrawer } from './components/Spotify/TurntableDrawer';
import { HeroSection } from './components/Hero/HeroSection';
import { PlayerSection } from './components/Player/PlayerSection';
import { TrackListSection } from './components/TrackList/TrackListSection';
import { AboutSection } from './components/About/AboutSection';
import { usePlayerStore } from './store/usePlayerStore';
import { initLenisInstance } from './lib/lenis';

export const App: React.FC = () => {
  const { activeTab, searchQuery, searchResults } = usePlayerStore();

  useEffect(() => {
    const lenis = initLenisInstance();
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-bg-primary text-text-primary flex overflow-hidden selection:bg-accent selection:text-black">
      {/* Left Spotify Sidebar Navigation */}
      <Sidebar />

      {/* Center Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-28 relative">
        {/* Top Header & Search Bar */}
        <TopNav />

        {/* Dynamic Tab Views */}
        <main className="flex-1">
          {activeTab === 'search' || searchQuery ? (
            <SearchResults />
          ) : activeTab === 'turntable' ? (
            <PlayerSection />
          ) : (
            <>
              <HeroSection />
              <PlayerSection />
              <TrackListSection />
              <AboutSection />
            </>
          )}
        </main>
      </div>

      {/* Bottom Fixed Spotify Player Bar */}
      <SpotifyPlayer />

      {/* Expandable 2D Turntable Drawer Modal */}
      <TurntableDrawer />
    </div>
  );
};

export default App;
