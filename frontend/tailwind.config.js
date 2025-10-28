export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#0a0a0a'
        },
        accent: {
          50: '#f0f0f0',
          100: '#d9d9d9',
          200: '#bfbfbf',
          300: '#a6a6a6',
          400: '#8c8c8c',
          500: '#737373',
          600: '#595959',
          700: '#404040',
          800: '#262626',
          900: '#0d0d0d'
        }
      },
      boxShadow: {
        glow: '0 0 0 2px rgba(139,92,246,0.25), 0 10px 25px -5px rgba(139,92,246,0.5), 0 8px 10px -6px rgba(139,92,246,0.4)'
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(1000px 600px at -10% -10%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(800px 500px at 110% 10%, rgba(236,72,153,0.2), transparent 60%)'
      }
    }
  },
  plugins: []
};