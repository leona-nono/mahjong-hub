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
          bg: 'rgb(var(--portal-bg-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--portal-elevated-rgb) / <alpha-value>)',
          panel: 'rgb(var(--portal-panel-rgb) / <alpha-value>)',
          border: 'var(--portal-border)',
          text: 'rgb(var(--portal-text-rgb) / <alpha-value>)',
          muted: 'rgb(var(--portal-muted-rgb) / <alpha-value>)',
          accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
          'accent-strong': 'rgb(var(--accent-strong-rgb) / <alpha-value>)',
          'accent-2': 'rgb(var(--accent-2-rgb) / <alpha-value>)',
          'on-accent': 'rgb(var(--on-accent-rgb) / <alpha-value>)',
          amber: 'rgb(var(--accent-2-rgb) / <alpha-value>)'
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
