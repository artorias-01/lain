import React from 'react';
import { useLibraryStore } from '../../store/useLibraryStore';

interface SidebarProps {
  currentTab?: string;
  onSelectTab?: (tab: 'home' | 'explore' | 'radio' | 'audio-lab' | 'liked' | 'playlists') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = 'home',
  onSelectTab,
}) => {
  const { likedTracks, playlists, createPlaylist } = useLibraryStore();

  const handleCreatePlaylist = () => {
    const name = window.prompt('Enter new playlist title:');
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  const defaultPlaylists = [
    'Chillout Minimal',
    'Ambient Focus',
    'Deep Monochrome',
    'Techno Warehouse',
    'Modular Synth Sessions',
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-player-height w-gutter-sidebar bg-surface-container-lowest z-40 flex flex-col justify-between overflow-y-auto select-none border-r border-outline-variant/10">
      <div className="p-space-base flex flex-col gap-space-lg">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-space-sm px-space-xs">
          <img
            alt="Kinesis Monochrome Sound Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1Vmr7Ux6tkb5BGFakjJ07JkZoE-yLOcQ3zvBjly0lvbGvoE0S4uTkZJTzqvWEvuZQsZkCC1bJyyaSbH5WlmWa9l25dK-LQdbuIGyJp67DOITuf3lBFD67x4pC3gKZWSSpmKPog-IvaY71R04XAWWeilK58RjlBDxNaVwiN-P6gsxJ9tWlGG3Zjx395ZxHt4OyCCISysoJBdUH5Cg8Ow2x9Ln2jWH-BdzoeDQogY8SqmeMsrnKPU2LwQIpA"
          />
          <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-wider">
            Kinesis
          </span>
        </div>

        {/* Discover Navigation */}
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-sm font-label-md text-label-md uppercase tracking-wider text-outline">
            Discover
          </span>
          <nav className="flex flex-col gap-space-2xs mt-space-xs">
            <button
              onClick={() => onSelectTab?.('home')}
              className={`flex items-center gap-space-md px-space-sm py-space-xs rounded-lg transition-all text-left ${
                currentTab === 'home'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-body-lg">home</span>
              <span className="font-label-lg text-label-lg">Home</span>
            </button>
            <button
              onClick={() => onSelectTab?.('explore')}
              className={`flex items-center gap-space-md px-space-sm py-space-xs rounded-lg transition-all text-left ${
                currentTab === 'explore'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-body-lg">explore</span>
              <span className="font-label-lg text-label-lg">Explore & Browse</span>
            </button>
            <button
              onClick={() => onSelectTab?.('radio')}
              className={`flex items-center gap-space-md px-space-sm py-space-xs rounded-lg transition-all text-left ${
                currentTab === 'radio'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-body-lg">sensors</span>
              <span className="font-label-lg text-label-lg">Radio</span>
            </button>
            <button
              onClick={() => {
                onSelectTab?.('audio-lab');
                document.getElementById('audio-lab-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-space-md px-space-sm py-space-xs rounded-lg transition-all text-left ${
                currentTab === 'audio-lab'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-body-lg">graphic_eq</span>
              <span className="font-label-lg text-label-lg">Audio Lab</span>
            </button>
          </nav>
        </div>

        {/* Your Library */}
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center justify-between px-space-sm">
            <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
              Your Library
            </span>
            <button
              onClick={handleCreatePlaylist}
              className="text-on-surface-variant hover:text-primary transition-colors p-1"
              title="Create new playlist"
            >
              <span className="material-symbols-outlined text-body-md">add</span>
            </button>
          </div>
          <nav className="flex flex-col gap-space-2xs mt-space-xs">
            <button
              onClick={() => onSelectTab?.('liked')}
              className={`flex items-center justify-between px-space-sm py-space-xs rounded-lg transition-all text-left w-full ${
                currentTab === 'liked'
                  ? 'bg-surface-container-highest text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-space-md">
                <span className="material-symbols-outlined text-body-lg text-primary">
                  favorite
                </span>
                <span className="font-label-lg text-label-lg">Liked Tracks</span>
              </div>
              <span className="font-mono-numbers text-label-md text-outline">
                {likedTracks.length}
              </span>
            </button>
            <button
              onClick={() => onSelectTab?.('explore')}
              className="flex items-center gap-space-md px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all text-left w-full"
            >
              <span className="material-symbols-outlined text-body-lg">person_pin</span>
              <span className="font-label-lg text-label-lg">Pinned Artists</span>
            </button>
          </nav>
        </div>

        {/* Playlists */}
        <div className="flex flex-col gap-space-2xs">
          <span className="px-space-sm font-label-md text-label-md uppercase tracking-wider text-outline">
            Playlists
          </span>
          <nav className="flex flex-col gap-space-2xs mt-space-xs">
            {playlists.length > 0
              ? playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => onSelectTab?.('playlists')}
                    className="flex items-center gap-space-md px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all truncate text-left w-full"
                  >
                    <span className="material-symbols-outlined text-body-md">queue_music</span>
                    <span className="font-label-lg text-label-lg truncate">{pl.name}</span>
                  </button>
                ))
              : defaultPlaylists.map((plName, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectTab?.('playlists')}
                    className="flex items-center gap-space-md px-space-sm py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all truncate text-left w-full"
                  >
                    <span className="material-symbols-outlined text-body-md">queue_music</span>
                    <span className="font-label-lg text-label-lg truncate">{plName}</span>
                  </button>
                ))}
          </nav>
        </div>
      </div>

      {/* Bottom Hi-Res Audio Card */}
      <div className="p-space-base">
        <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-outline-variant/10">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-outline uppercase">
              Hi-Res Audio
            </span>
            <span className="font-mono-numbers text-mono-numbers text-primary">
              96kHz / 24-bit FLAC
            </span>
          </div>
          <span className="material-symbols-outlined text-primary text-headline-sm">
            album
          </span>
        </div>
      </div>
    </aside>
  );
};
