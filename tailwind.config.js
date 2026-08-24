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
        // Matiks Matte Dark Palette
        background: '#121212', // Pure Dark Matte (Not obsidian/blue)
        card: '#1C1C1E',       // Raised Card Surface
        cardBorder: '#2C2C2E', // Subtle Gray Border
        accentGreen: '#B5F23D',// Soft Lime/Neon Green (used sparingly for active states)
        text: {
          main: '#FFFFFF',     // Crisp White Text
          muted: '#8E8E93',    // iOS System Gray Muted Text
        },
        // Category Badge Colors (from image)
        badge: {
          purple: '#8B5CF6',
          teal: '#2DD4BF',
          green: '#22C55E',
          yellow: '#EAB308',
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