/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgba(255,255,255,0.05)',
        border: 'rgba(255,255,255,0.08)',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
