
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The specific blue gradient from the reference (Light top, deep bottom)
        'factory-blue-light': '#81D4FA', 
        'factory-blue-main': '#4FC3F7',
        'factory-blue-deep': '#0288D1',
        
        // The "Conveyor Belt" Peach/Orange
        'factory-peach': '#FF8A65',
        'factory-peach-dark': '#E64A19', // For 3D shadows on buttons
        
        // The "Cylinder" Lavender
        'factory-lavender': '#B39DDB',
        
        // The "Light Sphere" Cream
        'factory-cream': '#FFF9C4',
        
        // Deep contrast text (instead of black)
        'factory-ink': '#1A237E', 
        
        'factory-glass': 'rgba(255, 255, 255, 0.4)',
      },
      boxShadow: {
        // Claymorphism shadows for UI to look like 3D models
        'clay-card': '8px 8px 16px rgba(2, 136, 209, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.4)',
        'clay-btn': '0px 6px 0px #E64A19, 0px 10px 10px rgba(0,0,0,0.15)', // 3D Push button look
        'clay-btn-pressed': '0px 2px 0px #E64A19, 0px 4px 4px rgba(0,0,0,0.1)',
      },
      backgroundImage: {
        'factory-gradient': 'radial-gradient(circle at 50% 0%, #81D4FA 0%, #29B6F6 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
