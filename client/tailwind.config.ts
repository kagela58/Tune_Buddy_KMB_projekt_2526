import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        lagoon: '#0ea5e9',
        coral: '#f97316',
        cloud: '#e2e8f0'
      }
    },
  },
  plugins: [],
};

export default config;
