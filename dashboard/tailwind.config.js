/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0a0a14',
        surface: '#12121f',
        border:  '#1e1e3a',
        violet:  { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
      },
      fontFamily: {
        title: ['Orbitron', 'sans-serif'],
        body:  ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
