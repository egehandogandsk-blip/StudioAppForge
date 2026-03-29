/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#030712',
        surface: 'rgba(255, 255, 255, 0.03)',
        primary: {
          500: '#3b82f6',
          glow: 'rgba(59, 130, 246, 0.5)',
        },
        accent: '#4594E9',
        darkAccent: '#0E1D3A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(69, 148, 233, 0.4)',
        'glow-strong': '0 0 40px rgba(69, 148, 233, 0.6)',
      }
    },
  },
  plugins: [],
}
