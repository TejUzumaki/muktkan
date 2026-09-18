/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vault-black': '#080808',
        'vault-dark': '#0F0F0F',
        'vault-gray': '#1A1A1A',
        'accent-gold': '#C5A572',
        'accent-gold-light': '#E2CEA6',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}
