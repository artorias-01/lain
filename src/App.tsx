import React from 'react';
import { MainTrackView } from './components/Player/MainTrackView';
import { SpotifyPlayerBar } from './components/Player/SpotifyPlayerBar';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 font-sans relative selection:bg-white selection:text-black">
      {/* Main Track List & Search View */}
      <MainTrackView />

      {/* Fixed Spotify Now-Playing Bottom Player Bar */}
      <SpotifyPlayerBar />
    </div>
  );
};

export default App;
