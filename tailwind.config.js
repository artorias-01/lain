/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lacquer: '#0E0D0B',
        substrate: '#171614',
        ochre: {
          DEFAULT: '#C89D5C',
          hover: '#DAB577',
          dim: 'rgba(200, 157, 92, 0.15)',
        },
        paper: {
          DEFAULT: '#F3EDE2',
          dim: 'rgba(243, 237, 226, 0.75)',
        },
        kraft: {
          DEFAULT: '#8C8275',
          dark: '#544E45',
        },
        scribe: {
          DEFAULT: '#26231F',
          subtle: '#1C1A17',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'spin-disc': 'spin 3.5s linear infinite',
      },
    },
  },
  plugins: [],
}
