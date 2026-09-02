/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lacquer: '#080B11',
        substrate: '#121824',
        surface: '#172030',
        retro: {
          bg: '#080B11',
          panel: '#121824',
          slot: '#172030',
          cyan: '#00F0FF',
          gold: '#FFB800',
          border: '#384556',
          shadow: '#04060A',
        },
        accent: {
          DEFAULT: '#00F0FF',
          hover: '#38E1FF',
          dim: 'rgba(0, 240, 255, 0.15)',
          glow: 'rgba(0, 240, 255, 0.25)',
        },
        ochre: {
          DEFAULT: '#00F0FF',
          hover: '#38E1FF',
          dim: 'rgba(0, 240, 255, 0.15)',
        },
        paper: {
          DEFAULT: '#F0F6FC',
          dim: '#8B949E',
        },
        kraft: {
          DEFAULT: '#8295A8',
          dark: '#47566A',
        },
        scribe: {
          DEFAULT: '#384556',
          subtle: '#202936',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
