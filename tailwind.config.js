/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reference Image Background: Periwinkle Blue to Soft White/Blue
        'ref-blue-start': '#A5C9FF', 
        'ref-blue-end': '#EBF4FF',
        
        // Reference Orange (Buttons/Accent)
        'ref-orange': '#FF9F68',
        'ref-orange-dark': '#FF844B',
        
        // Text Colors
        'ref-text': '#475569',
        'ref-text-light': '#94A3B8',
      },
      boxShadow: {
        // High quality "Clay" shadows for buttons
        'clay-btn': '0px 10px 20px rgba(255, 159, 104, 0.4), inset 0px 4px 6px rgba(255,255,255,0.4), inset 0px -4px 6px rgba(0,0,0,0.1)',
        'clay-btn-pressed': '0px 4px 10px rgba(255, 159, 104, 0.3), inset 0px 4px 8px rgba(0,0,0,0.1)',
        
        // Soft Glass Card Shadow
        'glass-card': '0 20px 40px -10px rgba(165, 201, 255, 0.4), 0 0 0 1px rgba(255,255,255,0.5) inset',
        
        // Icon floating shadow
        'icon-float': '0 15px 30px -5px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(180deg, #A5C9FF 0%, #EBF4FF 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FFB085 0%, #FF844B 100%)',
      },
      fontFamily: {
        'rounded': ['"Varela Round"', 'sans-serif'], // Soft rounded font if available, else sans
      }
    },
  },
  plugins: [],
}