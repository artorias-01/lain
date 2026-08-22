/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          elevated: 'var(--bg-elevated)',
          card: 'var(--bg-card)',
          surface: 'var(--bg-surface)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          hover: 'var(--accent-hover)',
          glow: 'var(--accent-glow)',
          dim: 'var(--accent-dim)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          subtle: 'var(--border-subtle)',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'Syne', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px var(--accent-glow))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 25px var(--accent-glow))' },
        }
      }
    },
  },
  plugins: [],
}
