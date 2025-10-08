/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      boxShadow: {
        glass: '0 20px 45px -15px rgba(99, 102, 241, 0.45)',
      },
      backgroundImage: {
        'aurora': 'linear-gradient(135deg, rgba(99,102,241,0.75), rgba(56,189,248,0.75))',
        'aurora-alt': 'linear-gradient(135deg, rgba(244,114,182,0.75), rgba(129,140,248,0.75))',
      },
    },
  },
  plugins: [],
};
