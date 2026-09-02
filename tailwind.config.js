/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lacquer: '#050505',
        substrate: '#0E110E',
        surface: '#141814',
        accent: {
          DEFAULT: 'var(--dynamic-accent)',
          hover: 'var(--dynamic-accent-hover)',
          dim: 'var(--dynamic-accent-dim)',
          glow: 'var(--dynamic-accent-glow)',
        },
        ochre: {
          DEFAULT: 'var(--dynamic-accent)',
          hover: 'var(--dynamic-accent-hover)',
          dim: 'var(--dynamic-accent-dim)',
        },
        paper: {
          DEFAULT: '#E5E7EB',
          dim: '#9CA3AF',
        },
        kraft: {
          DEFAULT: '#8B95A5',
          dark: '#4B5563',
        },
        scribe: {
          DEFAULT: '#1C261D',
          subtle: '#141D15',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'spin-disc': 'spin 3.2s linear infinite',
      },
    },
  },
  plugins: [],
}
