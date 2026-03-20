/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':   '#0a0a14',
        'bg-secondary': '#0d0d1a',
        'bg-card':      '#12121f',
        'bg-card-hover':'#1a1a2e',
        'border-base':  '#1e1e3a',
        'violet-primary':'#7c3aed',
        'violet-light': '#8b5cf6',
        'blue-accent':  '#3b82f6',
        'orange-accent':'#f97316',
        'green-status': '#22c55e',
        'gold':         '#eab308',
        'silver':       '#9ca3af',
        'bronze':       '#b45309',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        title: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up':   'countUp 2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
