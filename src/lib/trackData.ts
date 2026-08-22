export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  audioUrl: string;
  albumArtUrl: string;
  accentColor: string;
  bpm: number;
  year: string;
  genre: string;
}

// Procedural SVG album art generator (data URL)
const createAlbumArt = (title: string, color1: string, color2: string, symbol: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="80%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.6)" />
      </radialGradient>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0"/>
      </filter>
    </defs>
    <rect width="600" height="600" fill="url(#grad)" />
    <circle cx="300" cy="300" r="240" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
    <circle cx="300" cy="300" r="180" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <circle cx="300" cy="300" r="120" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="6" />
    <g transform="translate(300, 270) scale(2.2)" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
      ${symbol}
    </g>
    <text x="300" y="440" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="4">${title.toUpperCase()}</text>
    <rect width="600" height="600" fill="url(#vignette)" />
    <rect width="600" height="600" filter="url(#noise)" opacity="0.4" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight Resonance',
    artist: 'Aethelgard Trio',
    album: 'Analog Dreams Vol. 1',
    duration: 372,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    albumArtUrl: createAlbumArt('MIDNIGHT RESONANCE', '#1e1b4b', '#ff9d00', '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
    accentColor: '#ff9d00',
    bpm: 88,
    year: '2024',
    genre: 'Ambient Jazz / Lo-Fi',
  },
  {
    id: 'track-2',
    title: 'Neon Odyssey',
    artist: 'Synthetica & The Groove',
    album: 'Retro Futures',
    duration: 215,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3',
    albumArtUrl: createAlbumArt('NEON ODYSSEY', '#030712', '#00ff9d', '<circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z"/>'),
    accentColor: '#00ff9d',
    bpm: 114,
    year: '2023',
    genre: 'Synthwave / Electronic',
  },
  {
    id: 'track-3',
    title: 'Velvet Horizon',
    artist: 'Astral Echoes',
    album: 'Subterranean Tapes',
    duration: 284,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smooth-acoustics-11531.mp3',
    albumArtUrl: createAlbumArt('VELVET HORIZON', '#4c1d95', '#a855f7', '<path d="M2 10s3-3 6-3 6 3 6 3 3-3 6-3 6 3 6 3M2 14s3-3 6-3 6 3 6 3 3-3 6-3 6 3 6 3"/>'),
    accentColor: '#a855f7',
    bpm: 92,
    year: '2025',
    genre: 'Neosoul Chillout',
  },
  {
    id: 'track-4',
    title: 'Solar Eclipse',
    artist: 'Vapor Wave Ensemble',
    album: 'Chromaphonic Sessions',
    duration: 310,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769352e8.mp3?filename=ambient-piano-126245.mp3',
    albumArtUrl: createAlbumArt('SOLAR ECLIPSE', '#881337', '#ff3b5c', '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18w"/>'),
    accentColor: '#ff3b5c',
    bpm: 76,
    year: '2024',
    genre: 'Cinematic Ambient',
  },
  {
    id: 'track-5',
    title: 'Subaquatic Drift',
    artist: 'Deep Sea Frequency',
    album: 'Abyssal Reverie',
    duration: 248,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f32d39.mp3?filename=floating-abstract-124976.mp3',
    albumArtUrl: createAlbumArt('SUBAQUATIC DRIFT', '#0c4a6e', '#00e5ff', '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'),
    accentColor: '#00e5ff',
    bpm: 104,
    year: '2023',
    genre: 'Deep Minimal House',
  }
];
