/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'tarot-purple': '#0a0015',
        'tarot-gold': '#8b0000',
        'tarot-mystical': '#1a0a1f',
        'card-back': '#0d0d0d',
        'gothic-silver': '#c0c0c0',
        'gothic-crimson': '#8b0000',
        'gothic-violet': '#2d1b3d',
      },
    },
  },
  plugins: [],
}

