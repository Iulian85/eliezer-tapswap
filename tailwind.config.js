/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eliezer-bg': '#1a0033',
        'eliezer-purple': '#6d28d9',
        'eliezer-gold': '#F59E0B',
      }
    },
  },
  plugins: [],
}