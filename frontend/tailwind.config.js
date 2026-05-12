/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',        // Soft indigo
        secondary: '#818cf8',      // Lighter indigo
        accent: '#a5b4fc',         // Very light indigo
        dark: {
          DEFAULT: '#f8fafc',      // Very light gray/white
          light: '#f1f5f9',        // Light gray
          lighter: '#e2e8f0'       // Medium light gray
        },
        gold: {
          DEFAULT: '#f59e0b',      // Professional gold
          light: '#fbbf24',
          dark: '#d97706'
        },
        glass: 'rgba(99, 102, 241, 0.05)',
        'glass-light': 'rgba(129, 140, 248, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
