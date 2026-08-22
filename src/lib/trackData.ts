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

const createEditorialAlbumArt = (title: string, color1: string, color2: string, symbolPath: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="70%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.6)" />
      </radialGradient>
    </defs>
    <rect width="600" height="600" fill="url(#grad)" />
    <circle cx="300" cy="300" r="230" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <circle cx="300" cy="300" r="170" fill="none" stroke="rgba(255,255,255,0.12)" stroke-dasharray="4,8" stroke-width="2" />
    <g transform="translate(300, 260) scale(2.5)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
      ${symbolPath}
    </g>
    <text x="300" y="440" font-family="'Syne', 'Space Grotesk', sans-serif" font-weight="800" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="5">${title.toUpperCase()}</text>
    <text x="300" y="475" font-family="'JetBrains Mono', monospace" font-weight="400" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="3">ANALOG MASTERING • SPOTIFY HI-FI</text>
    <rect width="600" height="600" fill="url(#vignette)" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Clair de Lune (Analog Re-Master)',
    artist: 'Lumière Quartet',
    album: 'Nocturnes & Tapes',
    duration: 312,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    albumArtUrl: createEditorialAlbumArt('CLAIR DE LUNE', '#0f172a', '#d4af37', '<circle cx="0" cy="0" r="12"/><path d="M-8 -8 A12 12 0 0 0 8 8"/>'),
    accentColor: '#d4af37',
    bpm: 78,
    year: '2024',
    genre: 'Neoclassical Ambient',
  },
  {
    id: 'track-2',
    title: 'Midnight in Kyoto',
    artist: 'Subterranean Trio',
    album: 'Tokyo Tape Sessions',
    duration: 245,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3',
    albumArtUrl: createEditorialAlbumArt('MIDNIGHT KYOTO', '#1c1917', '#ff5733', '<path d="M-10 10 L0 -10 L10 10 Z"/>'),
    accentColor: '#ff5733',
    bpm: 86,
    year: '2023',
    genre: 'Modal Jazz / Chillout',
  },
  {
    id: 'track-3',
    title: 'Koto Sunrise',
    artist: 'Akira Takahashi & Ensemble',
    album: 'Pacific Harmonics',
    duration: 284,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smooth-acoustics-11531.mp3',
    albumArtUrl: createEditorialAlbumArt('KOTO SUNRISE', '#032b30', '#00e5ff', '<circle cx="0" cy="0" r="14"/><line x1="-14" y1="0" x2="14" y2="0"/>'),
    accentColor: '#00e5ff',
    bpm: 94,
    year: '2025',
    genre: 'Acoustic Fusion',
  },
  {
    id: 'track-4',
    title: 'Elegy for the Stars',
    artist: 'Astral Echo Ensemble',
    album: 'Cosmic Reverie',
    duration: 340,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c9769352e8.mp3?filename=ambient-piano-126245.mp3',
    albumArtUrl: createEditorialAlbumArt('ELEGY FOR STARS', '#2e1065', '#a855f7', '<path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z"/>'),
    accentColor: '#a855f7',
    bpm: 72,
    year: '2024',
    genre: 'Cinematic Minimalist',
  },
  {
    id: 'track-5',
    title: 'Subaquatic Jazz',
    artist: 'Deep Sea Frequency',
    album: 'Abyssal Tape Vol. 2',
    duration: 268,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f32d39.mp3?filename=floating-abstract-124976.mp3',
    albumArtUrl: createEditorialAlbumArt('SUBAQUATIC JAZZ', '#022c22', '#00ff9d', '<path d="M-12 6 C-6 -6, 6 18, 12 6"/>'),
    accentColor: '#00ff9d',
    bpm: 102,
    year: '2023',
    genre: 'Deep Ambient House',
  },
  {
    id: 'track-6',
    title: 'Starfall Highway',
    artist: 'Synthwave Velocity',
    album: 'Neon Horizon 1984',
    duration: 228,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-orchestra-16230.mp3',
    albumArtUrl: createEditorialAlbumArt('STARFALL HIGHWAY', '#831843', '#f43f5e', '<polygon points="0,-12 12,12 -12,12"/>'),
    accentColor: '#f43f5e',
    bpm: 118,
    year: '2024',
    genre: 'Synthwave / Retrowave',
  },
  {
    id: 'track-7',
    title: 'Velvet Rain',
    artist: 'Sora & The Piano',
    album: 'Midnight Coffee',
    duration: 195,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_bf8f8c474d.mp3?filename=relaxing-piano-10778.mp3',
    albumArtUrl: createEditorialAlbumArt('VELVET RAIN', '#1e1b4b', '#6366f1', '<circle cx="0" cy="0" r="10"/><path d="M0 -14 L0 14"/>'),
    accentColor: '#6366f1',
    bpm: 80,
    year: '2023',
    genre: 'Lo-Fi Chill Beats',
  },
  {
    id: 'track-8',
    title: 'Quantum Drift',
    artist: 'Cybernetic Mind',
    album: 'Neural Network Tapes',
    duration: 310,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c36e4f3a21.mp3?filename=futuristic-beat-11021.mp3',
    albumArtUrl: createEditorialAlbumArt('QUANTUM DRIFT', '#064e3b', '#10b981', '<rect x="-10" y="-10" width="20" height="20"/>'),
    accentColor: '#10b981',
    bpm: 124,
    year: '2025',
    genre: 'Cyberpunk Electronic',
  },
  {
    id: 'track-9',
    title: 'Golden Hour Reverie',
    artist: 'Solstice Ensemble',
    album: 'Warm Horizons',
    duration: 252,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6b12a83.mp3?filename=acoustic-guitar-11990.mp3',
    albumArtUrl: createEditorialAlbumArt('GOLDEN HOUR', '#7c2d12', '#f97316', '<circle cx="0" cy="0" r="14"/>'),
    accentColor: '#f97316',
    bpm: 90,
    year: '2024',
    genre: 'Indie Folk Acoustic',
  },
  {
    id: 'track-10',
    title: 'Interstellar Lullaby',
    artist: 'Orion Pulse',
    album: 'Deep Space Tapes',
    duration: 290,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/04/27/audio_0325b7a0cf.mp3?filename=ambient-space-11500.mp3',
    albumArtUrl: createEditorialAlbumArt('INTERSTELLAR', '#312e81', '#818cf8', '<ellipse cx="0" cy="0" rx="14" ry="6"/>'),
    accentColor: '#818cf8',
    bpm: 65,
    year: '2023',
    genre: 'Space Ambient',
  }
];
