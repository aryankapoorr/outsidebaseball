/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#070d14',
          900: '#0f1923',
          800: '#162032',
          700: '#1e2f48',
          600: '#243656',
          500: '#2d4470',
        },
        steel: {
          500: '#4e82c0',
          400: '#7aaad4',
        },
        ob: {
          red:          '#c8102e',
          'red-hover':  '#a50d25',
          'red-light':  '#e03555',
        },
      },
    },
  },
  plugins: [],
}
