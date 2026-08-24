/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#090D16', // Deep Obsidian Black
        card: '#121824',       // Dark Cyber Surface
        cardBorder: '#1F293D', // Muted Border
        neon: {
          light: '#39FF14',   // Cyber Neon Green
          DEFAULT: '#00FF66', // Core Gaming Green
          dark: '#00C853',    // Dark Green Accent
        },
        text: {
          main: '#F3F4F6',    // Off-white primary text
          muted: '#9CA3AF',   // Muted secondary text
        },
      },
      fontFamily: {
        orbitron: ['Orbitron_700Bold'],
        'orbitron-black': ['Orbitron_900Black'],
        rajdhani: ['Rajdhani_500Medium'],
        'rajdhani-bold': ['Rajdhani_700Bold'],
      },
    },
  },
  plugins: [],
};