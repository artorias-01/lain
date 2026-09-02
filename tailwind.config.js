/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lacquer: '#0A0B0E',
        substrate: '#13151A',
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
          DEFAULT: '#F2F4F8',
          dim: 'rgba(242, 244, 248, 0.75)',
        },
        kraft: {
          DEFAULT: '#8B93A2',
          dark: '#586070',
        },
        scribe: {
          DEFAULT: '#20232B',
          subtle: '#171920',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'spin-disc': 'spin 3.2s linear infinite',
      },
    },
  },
  plugins: [],
}
