
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eliezer-bg': '#81D4FA', // Soft Blue base
        'eliezer-purple': '#7986CB', // Soft Indigo
        'eliezer-gold': '#FFCC80', // Soft Gold
        'eliezer-peach': '#FFAB91', // Peach accent
      }
    },
  },
  plugins: [],
}
