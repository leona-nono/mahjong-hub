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
        }
      }
    }
  },
  plugins: []
};

export default config;
