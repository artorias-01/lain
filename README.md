# LaIN — Music Player

An editorial, minimal web music player and listening room backed by self-hosted `yt-dlp` Range-proxy streaming, direct YouTube Music catalog search, dynamic artwork-derived ambient theming, and authentic GSAP continuous-momentum vinyl physics.

Designed with an intentional cool neutral obsidian aesthetic with artwork-driven dynamic accents.

---

## Features

- **Self-Hosted Audio Streaming**:
  - `GET /api/stream/:videoId` backend endpoint powered by `yt-dlp`.
  - HTTP 206 Partial Content Range-proxying enables native seekbar scrubbing with the browser's HTML5 `<audio>` element without downloading whole songs.
  - In-flight promise map deduplicates concurrent requests for the same track.
  - 4-hour in-memory URL caching prevents redundant extractions.
- **Server-Side Cached Search**:
  - `GET /api/search?q=...` backend endpoint with 2-hour normalized query caching.
  - YouTube Data API v3 key is held strictly server-side (never exposed in the client bundle).
  - Batched `videos.list` requests (up to 50 IDs) for embeddability and ISO 8601 duration parsing.
  - 450ms debounced search input on the client.
  - Pre-resolved starter catalog featuring verified authentic recordings (Daft Punk, Ryo Fukui, Miles Davis, Bill Evans Trio, Chopin, Hans Zimmer, Lofi Girl).
- **Japanese Jazz Kissa Aesthetic Direction**:
  - **Committed 6-Color Palette**: Deep Lacquer (`#0E0D0B`), Smoked Cedar (`#171614`), Vinyl Gold (`#C89D5C`), Unbleached Paper (`#F3EDE2`), Aged Kraft (`#8C8275`), and Studio Scribe (`#26231F`).
  - **Typography**: [Syne](https://fonts.google.com/specimen/Syne) display font paired with [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) using `font-variant-numeric: tabular-nums` for aligned columns.
  - **Zero AI UI Tells**: No uppercase tracking-wide eyebrows, no repetitive rounded-card drop shadows, no fake monospace data labels, and no fake branding copy.
- **Signature Motion**:
  - 2D circular vinyl record with concentric micro-grooves and specular glare.
  - Continuous GSAP tween runs off `useRef` directly (never React state per frame).
  - Smooth inertial acceleration on play (`power2.in`) and friction deceleration on pause (`power2.out`).
  - Never resets rotation to 0; play/pause toggling preserves angular momentum.
  - Lenis smooth scrolling synchronized to GSAP's ticker.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```
*(The postinstall script will automatically detect or download the standalone `yt-dlp` binary into `bin/`)*

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` if you wish to enable live YouTube search across the entire YouTube catalog:
```bash
cp .env.example .env
```
Add your YouTube Data API v3 key:
```env
YOUTUBE_API_KEY=your_key_here
```
*(If no key is configured, the player searches the curated starter catalog gracefully).*

### 3. Development Server
```bash
npm run dev
```
Starts the Vite dev server with integrated API streaming middleware at `http://localhost:5173`.

### 4. Production Build & Server
```bash
npm run build
npm run serve
```

---

## Architecture

```
├── bin/                    # yt-dlp standalone executable (auto-downloaded)
├── scripts/                # Setup & install utilities
├── server/
│   ├── apiRouter.ts        # Connect / Express API router
│   ├── streamProxy.ts      # Range-request streaming proxy (HTTP 206)
│   ├── ytDlpService.ts     # Stream resolution & URL caching
│   ├── searchService.ts    # Search caching & YouTube API client
│   └── index.mjs           # Standalone production HTTP server
└── src/
    ├── components/
    │   └── Player/
    │       ├── MainTrackView.tsx      # Editorial ledger & debounced search
    │       ├── ProgressBar.tsx        # Tabular scrubbar with Range seeking
    │       └── SpotifyPlayerBar.tsx   # Flush-rule player bar & vinyl disc
    ├── lib/
    │   ├── nativeAudioEngine.ts       # HTML5 Audio engine wrapper
    │   ├── youtubeSearch.ts           # Client search adapter
    │   └── lenis.ts                   # Smooth scroll & GSAP ticker sync
    └── styles/
        └── tokens.css                 # CSS variables & design tokens
```

---

## License

MIT
