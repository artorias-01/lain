import React, { useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { TrackItem } from '../../lib/nativeAudioEngine';

export const MainTrackView: React.FC = () => {
  const {
    searchResults,
    activeTrack,
    isPlaying,
    playTrack,
    togglePlay,
  } = usePlayerStore();

  const { isLiked, toggleLike } = useLibraryStore();

  const [engineMode, setEngineMode] = useState<'flac' | 'atmos'>('flac');

  const formatDuration = (secs: number): string => {
    if (!isFinite(secs) || secs <= 0) return '3:45';
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTrackClick = (track: TrackItem) => {
    if (activeTrack && activeTrack.videoId === track.videoId) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const isCurrentTrackLiked = activeTrack ? isLiked(activeTrack.videoId) : false;

  // Fallback / Starter tracks for Jump Back In & Editor's Picks
  const displayTracks = searchResults.length > 0 ? searchResults : [];

  return (
    <main className="relative pt-16 bg-surface w-full min-h-screen px-space-xl pb-space-3xl select-none">
      <div className="flex flex-col w-full pb-space-3xl">
        {/* ─────────────────────────────────────────────────────────────
            1. DYNAMIC AUDIO LAB SPOTLIGHT BANNER
           ───────────────────────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl lg:p-space-2xl shadow-xl mt-space-lg">
          {/* Ambient Glows */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-surface-variant/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 bottom-0 w-80 h-80 bg-surface-container-high/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            {/* Metadata & CTAs (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-space-md">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="px-2.5 py-1 bg-primary text-surface-dim font-label-md text-label-md uppercase tracking-wider rounded font-bold">
                  PREMIERE
                </span>
                <span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant font-label-md text-label-md uppercase tracking-wider rounded flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-body-sm text-primary">graphic_eq</span>
                  HI-RES LOSSLESS 24-BIT 96KHZ
                </span>
                <span className="font-mono-numbers text-mono-numbers text-outline">
                  CAT: KIN-8802
                </span>
              </div>

              <div className="flex flex-col gap-space-2xs mt-space-xs">
                <span className="font-label-lg text-label-lg uppercase tracking-widest text-secondary font-semibold">
                  {activeTrack ? activeTrack.artist : 'Aura & The Void'}
                </span>
                <h1 className="font-display-hero text-display-hero text-primary tracking-tight uppercase leading-none">
                  {activeTrack ? activeTrack.title : 'Echoes in Monochrome'}
                </h1>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                An architectural exploration of low-frequency oscillations and stark dynamic contrast. Mastered purely for high-fidelity spatial playback with zero dynamic range compression.
              </p>

              <div className="flex items-center gap-space-md text-outline font-mono-numbers text-body-sm py-space-2xs">
                <span>{displayTracks.length || 9} Tracks</span>
                <span className="text-surface-variant">•</span>
                <span>42:18 Runtime</span>
                <span className="text-surface-variant">•</span>
                <span className="text-on-surface">Electronic / Spatial Drone</span>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                <button
                  onClick={togglePlay}
                  className="flex items-center justify-center gap-space-sm px-space-xl h-12 bg-primary text-surface-dim rounded-full font-label-lg text-label-lg uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg font-bold"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlaying ? 'Pause' : 'Play Now'}</span>
                </button>

                {activeTrack && (
                  <button
                    onClick={() => toggleLike(activeTrack)}
                    className="flex items-center justify-center gap-space-xs px-space-lg h-12 bg-surface-container-high hover:bg-surface-variant text-primary rounded-full font-label-lg text-label-lg transition-all"
                  >
                    <span className={`material-symbols-outlined text-body-lg ${isCurrentTrackLiked ? 'text-primary' : ''}`}>
                      {isCurrentTrackLiked ? 'bookmark_added' : 'bookmark_add'}
                    </span>
                    <span>{isCurrentTrackLiked ? 'Saved' : 'Save to Library'}</span>
                  </button>
                )}

                <div className="relative group">
                  <button className="w-12 h-12 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Album Art & High-Pass Filter Frame (5 Cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 rounded-xl overflow-hidden bg-surface-container shadow-2xl">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125"
                  alt="Spatial Album Artwork"
                  src={
                    activeTrack?.thumbnailUrl ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuB43XAV34srnyD1gmei0qnEkJlP-o8E9JAtT_F39lSCT1GPBbKcugy_uovSNo6NcXK4UoP35uu0ZrThumWDPWDYGr0TN6yfrIdLW4HpX5CdZvK-PPAZIwTt-fzIq2Etb_Y4S-0fwNnITiaJ45hzPvBJy6t_RqGc4OCjZ1p3NLzN7voXBBZkK54SAF6rSXxZqSnCuIyuc7ZZwBvBBFHMlCE3wDgVI66FCoiPJ6CstSLLrs0o29QYZ7Zy'
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-space-base left-space-base right-space-base flex items-center justify-between pointer-events-none">
                  <div className="flex flex-col">
                    <span className="font-mono-numbers text-label-md text-outline uppercase tracking-wider">
                      Spatial Audio Matrix
                    </span>
                    <span className="font-label-lg text-label-lg text-primary font-semibold">
                      Ultra HD Master FLAC
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-body-lg">
                      all_inclusive
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. JUMP BACK IN: COMPACT 6-GRID
           ───────────────────────────────────────────────────────────── */}
        <section className="mt-space-2xl flex flex-col gap-space-base">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-space-sm">
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Jump Back In
              </h2>
              <span className="font-mono-numbers text-mono-numbers text-outline uppercase">
                Recent Workspaces
              </span>
            </div>
            <button className="font-label-md text-label-md text-outline hover:text-primary uppercase tracking-wider transition-colors">
              Show All ({displayTracks.length || 14})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {(displayTracks.slice(0, 6).length > 0
              ? displayTracks.slice(0, 6)
              : [
                  {
                    title: 'Deep Modular Ambient',
                    sub: 'Updated 2h ago • 48 tracks',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-jQz1qLxKUda2ZqzOwORt8tA1QVYu35LgCMIc-3I_MGgtADHWRfm67erdCR65J86aU7In6IX_lbdO4YzrCQoknX06QWYB9FFj1IipJtenGh0cWk8cp8vTqVN_Og7hZcWp2h49oGSXyqq16VZ1Qb33MYTvRyeIBFcbKtEIA0FstnNMcMoFGLKtIU4DU8wUglEpuu9sR_kF1ruzOpLlSa3nvaYshE7yMfBjUu5By4fZx6xFxwB6Q2dp',
                  },
                  {
                    title: 'Heavy Techno Sessions',
                    sub: 'Live Recording • Berlin',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiuVk0Bb9OsTpT1rujkjsiEulTRf7FeF6JAXfJOZl22C2dOCQC7ePogJkjgUW5_SM9O70krDEKga7QHUXYU1bElddEc3jojuErylrdbCacHslUzzZmUaXAmeXokiEgz3e_m_G0inMfr2m_EWEnSRvP3DNUmPlwsA4w5E2gobaFhvl_Wv_8SAKF-650PqilwZTKDxKIQxuycrLdn62o2cDQ9vnj20WQNbdx6C_8GjTVn6i7CfB_8yVT',
                  },
                  {
                    title: 'Dark Ambient Drone',
                    sub: 'Sub-bass Focus • 3.2k Likes',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAZVd5HHmvcpTHr9vFi7UM_VQ5W0IRsMMdsKzgEmy8wf1HOXyXfVw9s4OxadyO2gGWbjtjgCbmyKMr5CYZB7TY4kv5EbVVowzMzOddt25LPjFbG0p51r2qbErxGT2HhoWbmpUMzUI59x5nPj23wQDOhNS8zgLONmms7HQ2-hW4qvINBzWiS71UDIVikvXokcxzsb5ea04-vyqlA51OHIF4AuylXcQ--JKAydgWwLm92dupBdRAQKgX',
                  },
                  {
                    title: 'Minimalist Piano Etudes',
                    sub: 'Felt & Mechanical • 18 tracks',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBON6igV-3b7fPv0Jz73MZOsa3pXbrtlvVxrWKcyw6tvw1l64-6X1jQLAO0BP0YNAflVdfLVGKINMVDK32YKAHlPv32HHvT_jzT4ZdE5WycJZ-o24jYc5jwk6Y14du28PPV60SgSe4fJ6edrkEoZeWtDPYATKaWA_7STLKT9Ji4ezHsBTCZozdYjx6WEZ9XdV4uS0Xx1NQgbgt7-Pt3zb188UcjVDkfU99CvSkeHUmXzZ3vKvmIAzf7',
                  },
                  {
                    title: 'Chiaroscuro Beats',
                    sub: 'Downtempo & Lo-Fi Noir',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5m0jODJgR4QApIbMKOtYb0NV5TBs4K6xTKB0pJ1d97x_5f_kUEINwNGw2e_zB7FnrNJZ36Pel4eX7ttSy7pvNpgzpSCKzGqUVY9LyGCIC5hMowHaGE4lcGpEk03JDdf7yTGMFsfj0bP-ACZ5Ii3V80ASPfE2iqDefkJV6dX06FA04uREz0HTFvrQHSwIjne0ei87lJ3G_31rb1Y-lSvRq2TbzuowDT2_Bw-949FAD0fwFzGmiLK3K',
                  },
                  {
                    title: 'Late Night Focus',
                    sub: 'Continuous Flow • 8 hrs',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGAw2Igwk9zlImkfTdwmiO0oeYXLrzbECy3RkRQOB7Hsu9mnBOq_272G3IdwKoageET210nqP9l960wkyC3_sws_cXB2J9zCd1Q7NvPi8lnmCPBHXkcEyXXtKvj_-Jh1DkpbI_Y6xFbkq8xYLHre_MgRErQYEJqtrQj4mlNykqnJwVSF45YqdPrdi4MqSFsaOfeO88p4NsTp9hJRrt6lEBjpN6GgIt6gbodGqPNt5bXjpxAQTffADl',
                  },
                ]
            ).map((item, idx) => {
              const track = 'videoId' in item ? (item as TrackItem) : null;
              return (
                <div
                  key={idx}
                  onClick={() => track && handleTrackClick(track)}
                  className="group relative flex items-center bg-surface-container-low hover:bg-surface-container-high rounded-lg overflow-hidden transition-all cursor-pointer p-space-2xs pr-space-base border border-outline-variant/10"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-container-highest shrink-0 overflow-hidden rounded">
                    <img
                      className="w-full h-full object-cover grayscale"
                      alt=""
                      src={track?.thumbnailUrl || ('img' in item ? item.img : '')}
                    />
                  </div>
                  <div className="flex-1 min-w-0 px-space-md">
                    <span className="font-label-lg text-label-lg text-primary truncate block font-semibold">
                      {track?.title || item.title}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline truncate block">
                      {track ? `${track.artist} • ${formatDuration(track.duration)}` : ('sub' in item ? item.sub : '')}
                    </span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary text-surface-dim flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-md shrink-0">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. EDITOR'S MONOCHROME PICKS
           ───────────────────────────────────────────────────────────── */}
        <section className="mt-space-2xl flex flex-col gap-space-base">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Editor's Monochrome Picks
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
                Handpicked sonic explorations released exclusively in ultra-lossless fidelity.
              </p>
            </div>
            <div className="flex items-center gap-space-xs">
              <button className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-body-md">chevron_left</span>
              </button>
              <button className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-body-md">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-base">
            {[
              {
                title: 'Void Resonance',
                artist: 'Studio Noir',
                stat: '48.2k Followers',
                badge: '96kHz',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmntNQgt5kvyoBj2ddbGV7NNSbDLFaDJW-0iq86bzXz-mXNZpgzpoMlWFeRK8MOGfe-i1lu3X03r5VM19s3mLeLaRxHJdbqIKNRJt2K1F2UcNV-sOgRzW_BVWoBTykLwnYtDKyYxukPaZs0hG4NpwONeFMX8fezyG-yAyYIX7h-6I_tb73ytr1HxGkf3_OwdWVP9rqbBEnQKF4vBbarmkxHLRj2tk0IVaX3ASSOlzqea1wLkIGtKdE',
              },
              {
                title: 'Sub-Frequency Vol. 4',
                artist: 'Bass Architecture',
                stat: '1hr 14m Runtime',
                badge: 'Lossless',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqy5W8_n8ywt4NsyNYL4aPeDohEIHxTdXch4Bvr52PRiBZNXMVZ5UXfDq9D3HKboNag4_laH5OrLHeyZ8ocrXTTmbE-SV1SyIMIviCYa0CA3KdDuLtTqR36zBarPmq_DaYM9qaTgrdMBVgl7lojULaW1JSyBfxREwAjLH_pJmaBRBIEYf7yWaR45VdFSPMPRXv4_QlmdyMLsgbUECUpPvSodnY-tnO8IRq1B-fKSYMAG_bs8KGLZVI',
              },
              {
                title: 'Achromatic Jazz Trio',
                artist: 'The New Quintet',
                stat: '12.9k Followers',
                badge: 'Studio M',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVJ_aqMbPpX5c6RS_wsmr6Mu3mufG-J-_ZrQkF7DizeCvl_h8dknQHc0zAPuawF9iM3aK1r3wbcS-rdx3suc4m533I02Ka8Z-0oMEJ3rOQ8b_8L7GPy1Huneo6fKLnTSLdcAizH5lHhi6-NrIlY_EhPCyGDVDwDJAkE3W39YlB_Pf6XczZkoRMJJ0JNjnieCxqhZ7lfNz4DcOKloXLMgErmm9AutABNXFEKrterPXMR6FjCxgy2bLK',
              },
              {
                title: 'Cinematic Neo-Classical',
                artist: 'Julian Vane',
                stat: '63.1k Followers',
                badge: '192kHz',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWrCBwZrwlf2faXnbxEXQN3o4dBFOUfGYMBrS7dCRjlqbbLAGdeo6yZt3JgDtUCBDj0aisrJ0uKkgXMFjaZSA70-dJ_GrrJVYoy0enn3IqDg-r3He3UYeaiSh0d2yzsAZi97ChS8LZycyHj9uPXCfrea1uO4So1IoBnknRmjlQQNGYTIFUzydM-6gyE4nbEaLYHdpwGsvJPIpsevNFeyxeUTLGWtekkl3xBOuUdOZpLpk-3QnTbhAf',
              },
              {
                title: 'Experimental Glitch & Noise',
                artist: 'Synthetica',
                stat: '28.4k Followers',
                badge: 'Raw Audio',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQOnLjRU2Ki7IMhKOZCf3NmIw-3x7ebdxktONqEhe2tiKUpW3twP6ZLwkzrjvaRunP4N521DSmEaH7V8MSJT2BrJE6nP4TRMvMW8moYhbC7NbePdqY3J-M48QHNChyQcBC1YbvRA3YnmH6zqrf5d_OzlfR1ZJG11ABM_fXsaDcyRW6Mr6Y4NRNIebRUhJ_d68z2sr3WIyV-uX9d_KE83NWIsDxkwblLbNB1wl9rdp40s4oKBRNf05F',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="group flex flex-col bg-surface-container-low hover:bg-surface-container rounded-xl p-space-md transition-all cursor-pointer border border-outline-variant/10"
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-surface-container-highest mb-space-md">
                  <img
                    className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                    alt={card.title}
                    src={card.img}
                  />
                  <button className="absolute right-space-sm bottom-space-sm w-11 h-11 rounded-full bg-primary text-surface-dim flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-surface-dim/80 backdrop-blur text-primary font-mono-numbers text-label-md rounded">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary truncate font-semibold">
                  {card.title}
                </h3>
                <span className="font-body-sm text-body-sm text-outline truncate mt-space-2xs">
                  {card.artist}
                </span>
                <span className="font-mono-numbers text-label-md text-on-surface-variant mt-space-xs">
                  {card.stat}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. TWO-COLUMN: TOP CHARTS + AUDIO LAB SPECTRUM
           ───────────────────────────────────────────────────────────── */}
        <section className="mt-space-2xl grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* Left Column: Trending Oscillations (Top Charts Table) */}
          <div className="lg:col-span-7 flex flex-col gap-space-base">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-space-sm">
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Trending Oscillations
                </h2>
                <span className="font-mono-numbers text-label-md text-outline">
                  GLOBAL TOP 50
                </span>
              </div>
              <button className="font-label-md text-label-md text-outline hover:text-primary uppercase tracking-wider transition-colors">
                See Full Chart
              </button>
            </div>

            {/* Tracklist Table */}
            <div className="flex flex-col w-full bg-surface-container-lowest rounded-xl p-space-sm border border-outline-variant/10">
              {/* Table Header */}
              <div className="grid grid-cols-12 items-center px-space-md py-space-xs text-outline font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/10 mb-1">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Title & Artist</div>
                <div className="col-span-3 hidden sm:block">Album</div>
                <div className="col-span-2 text-right">Time</div>
              </div>

              {displayTracks.map((track, idx) => {
                const isActive = activeTrack?.videoId === track.videoId;
                const isRowPlaying = isActive && isPlaying;
                const trackLiked = isLiked(track.videoId);

                return (
                  <div
                    key={track.videoId || idx}
                    onClick={() => handleTrackClick(track)}
                    className={`group grid grid-cols-12 items-center px-space-md py-space-sm rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-surface-container-high'
                        : 'hover:bg-surface-container-low'
                    }`}
                  >
                    {/* Col 1: Play state or Index */}
                    <div className="col-span-1 flex justify-center items-center font-mono-numbers text-outline group-hover:text-primary">
                      {isRowPlaying ? (
                        <div className="flex items-end gap-0.5 h-4 w-4">
                          <span className="w-1 bg-primary rounded-full animate-pulse h-3" />
                          <span className="w-1 bg-primary rounded-full animate-pulse h-4" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 bg-primary rounded-full animate-pulse h-2" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden text-outline">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="material-symbols-outlined hidden group-hover:block text-headline-sm text-primary">
                            play_arrow
                          </span>
                        </>
                      )}
                    </div>

                    {/* Col 2: Thumbnail + Title & Artist */}
                    <div className="col-span-6 flex items-center gap-space-md min-w-0 pr-space-sm">
                      <div className="w-10 h-10 rounded bg-surface-container shrink-0 overflow-hidden">
                        <img
                          className="w-full h-full object-cover grayscale"
                          alt=""
                          src={track.thumbnailUrl}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className={`font-label-lg text-label-lg truncate ${isActive ? 'text-primary font-bold' : 'text-primary'}`}>
                          {track.title}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary truncate">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    {/* Col 3: Album */}
                    <div className="col-span-3 hidden sm:block font-body-sm text-body-sm text-outline truncate">
                      {track.album || 'Lossless Frequency Master'}
                    </div>

                    {/* Col 4: Favorite & Duration */}
                    <div className="col-span-2 flex items-center justify-end gap-space-sm font-mono-numbers text-mono-numbers text-outline">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className={`transition-all ${
                          trackLiked
                            ? 'text-primary'
                            : 'text-outline group-hover:text-primary opacity-0 group-hover:opacity-100'
                        }`}
                        title={trackLiked ? 'Unlike' : 'Like'}
                      >
                        <span
                          className="material-symbols-outlined text-headline-sm"
                          style={{ fontVariationSettings: trackLiked ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                      <span className={isActive ? 'text-primary' : ''}>
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Audio Lab & Lossless Spectrum Analyzer */}
          <div id="audio-lab-section" className="lg:col-span-5 flex flex-col gap-space-base">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-headline-md">tune</span>
                <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Audio Lab
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-mono-numbers text-label-md font-semibold">
                DSP ENGINE V2
              </span>
            </div>

            {/* Analyzer Console Module */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col gap-space-lg shadow-xl relative overflow-hidden border border-outline-variant/10">
              {/* Frequency Curve Header */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
                    Active Real-Time Spectrum
                  </span>
                  <span className="font-mono-numbers text-mono-numbers text-primary font-medium">
                    20Hz - 48,000Hz (Direct Stream)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEngineMode('flac')}
                    className={`px-2.5 py-1 rounded-full text-label-md font-mono-numbers transition-all ${
                      engineMode === 'flac'
                        ? 'bg-primary text-surface-dim font-bold'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    FLAC 24/96
                  </button>
                  <button
                    onClick={() => setEngineMode('atmos')}
                    className={`px-2.5 py-1 rounded-full text-label-md font-mono-numbers transition-all ${
                      engineMode === 'atmos'
                        ? 'bg-primary text-surface-dim font-bold'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    ATMOS
                  </button>
                </div>
              </div>

              {/* Precision SVG Waveform Frequency Bars */}
              <div className="w-full bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm border border-outline-variant/10">
                <svg className="w-full h-28" fill="none" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
                  <line className="text-surface-variant/40" stroke="currentColor" strokeDasharray="2 4" x1="0" x2="300" y1="20" y2="20" />
                  <line className="text-surface-variant/40" stroke="currentColor" strokeDasharray="2 4" x1="0" x2="300" y1="40" y2="40" />
                  <line className="text-surface-variant/40" stroke="currentColor" strokeDasharray="2 4" x1="0" x2="300" y1="60" y2="60" />

                  {/* Rectangles */}
                  <rect className="fill-outline" height="25" rx="1" width="4" x="5" y="55" />
                  <rect className="fill-outline" height="38" rx="1" width="4" x="13" y="42" />
                  <rect className="fill-primary opacity-90" height="50" rx="1" width="4" x="21" y="30" />
                  <rect className="fill-primary" height="62" rx="1" width="4" x="29" y="18" />
                  <rect className="fill-primary" height="70" rx="1" width="4" x="37" y="10" />
                  <rect className="fill-primary" height="58" rx="1" width="4" x="45" y="22" />
                  <rect className="fill-outline" height="45" rx="1" width="4" x="53" y="35" />
                  <rect className="fill-outline" height="35" rx="1" width="4" x="61" y="45" />
                  <rect className="fill-primary opacity-80" height="52" rx="1" width="4" x="69" y="28" />
                  <rect className="fill-primary" height="65" rx="1" width="4" x="77" y="15" />
                  <rect className="fill-primary" height="72" rx="1" width="4" x="85" y="8" />
                  <rect className="fill-primary" height="56" rx="1" width="4" x="93" y="24" />
                  <rect className="fill-outline" height="42" rx="1" width="4" x="101" y="38" />
                  <rect className="fill-outline" height="30" rx="1" width="4" x="109" y="50" />
                  <rect className="fill-outline" height="40" rx="1" width="4" x="117" y="40" />
                  <rect className="fill-primary" height="62" rx="1" width="4" x="125" y="18" />
                  <rect className="fill-primary" height="68" rx="1" width="4" x="133" y="12" />
                  <rect className="fill-primary opacity-90" height="54" rx="1" width="4" x="141" y="26" />
                  <rect className="fill-outline" height="46" rx="1" width="4" x="149" y="34" />
                  <rect className="fill-outline" height="32" rx="1" width="4" x="157" y="48" />
                  <rect className="fill-surface-variant" height="22" rx="1" width="4" x="165" y="58" />
                  <rect className="fill-primary opacity-80" height="48" rx="1" width="4" x="173" y="32" />
                  <rect className="fill-primary" height="60" rx="1" width="4" x="181" y="20" />
                  <rect className="fill-primary" height="66" rx="1" width="4" x="189" y="14" />
                  <rect className="fill-primary opacity-90" height="52" rx="1" width="4" x="197" y="28" />
                  <rect className="fill-outline" height="36" rx="1" width="4" x="205" y="44" />
                  <rect className="fill-outline" height="26" rx="1" width="4" x="213" y="54" />
                  <rect className="fill-outline" height="42" rx="1" width="4" x="221" y="38" />
                  <rect className="fill-primary" height="58" rx="1" width="4" x="229" y="22" />
                  <rect className="fill-primary" height="64" rx="1" width="4" x="237" y="16" />
                  <rect className="fill-primary opacity-80" height="50" rx="1" width="4" x="245" y="30" />
                  <rect className="fill-outline" height="34" rx="1" width="4" x="253" y="46" />
                  <rect className="fill-surface-variant" height="20" rx="1" width="4" x="261" y="60" />
                  <rect className="fill-surface-variant" height="12" rx="1" width="4" x="269" y="68" />
                  <rect className="fill-surface-variant" height="8" rx="1" width="4" x="277" y="72" />
                  <rect className="fill-surface-variant" height="5" rx="1" width="4" x="285" y="75" />
                </svg>

                {/* Frequency Axis */}
                <div className="flex justify-between items-center text-outline font-mono-numbers text-label-md pt-1">
                  <span>20 Hz</span>
                  <span>250 Hz</span>
                  <span>1 kHz</span>
                  <span>4 kHz</span>
                  <span>16 kHz</span>
                  <span>48 kHz</span>
                </div>
              </div>

              {/* Telemetry Indicators */}
              <div className="grid grid-cols-3 gap-space-sm">
                <div className="bg-surface-container-low p-space-sm rounded flex flex-col border border-outline-variant/10">
                  <span className="font-label-md text-label-md text-outline uppercase">Dynamic Range</span>
                  <span className="font-mono-numbers text-mono-numbers text-primary font-bold">118.4 dB</span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded flex flex-col border border-outline-variant/10">
                  <span className="font-label-md text-label-md text-outline uppercase">Jitter Buffer</span>
                  <span className="font-mono-numbers text-mono-numbers text-primary font-bold">0.02 ms</span>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded flex flex-col border border-outline-variant/10">
                  <span className="font-label-md text-label-md text-outline uppercase">Bitrate</span>
                  <span className="font-mono-numbers text-mono-numbers text-primary font-bold">4608 kbps</span>
                </div>
              </div>

              {/* Daily Soundwave Digest Banner */}
              <div className="bg-surface-container-high rounded-lg p-space-md flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-primary text-surface-dim flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-headline-sm">insights</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-primary font-semibold">Daily Soundwave Digest #42</span>
                    <span className="font-body-sm text-body-sm text-outline">Acoustic resonance in sub-zero listening environments</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-variant text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-body-md">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
