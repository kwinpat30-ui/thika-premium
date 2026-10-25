/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkCharcoal: '#0a0a0a',
        panelGray: '#1a1a1a',
        neonCyan: '#00f3ff',
      }
    },
  },
  plugins: [],
}