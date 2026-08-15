import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rainbow: {
          red: '#FF6B6B',
          orange: '#FFA94D',
          yellow: '#FFD43B',
          green: '#51CF66',
          blue: '#4DABF7',
          indigo: '#748FFC',
          violet: '#B197FC',
          pink: '#F783AC'
        },
        portal: {
          bg: '#0b1220',
          elevated: '#121a2b',
          panel: '#162033',
          border: 'rgba(148, 163, 184, 0.14)',
          text: '#e8eef7',
          muted: '#94a3b8',
          accent: '#2dd4bf',
          amber: '#fbbf24'
        }
      },
      fontFamily: {
        display: ['var(--font-portal-display)', 'Georgia', 'serif'],
        sans: ['var(--font-portal-sans)', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        portal: '0 18px 40px -20px rgba(0,0,0,.65)'
      }
    }
  },
  plugins: []
};

export default config;
