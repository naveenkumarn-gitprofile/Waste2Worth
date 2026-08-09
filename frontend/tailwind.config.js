/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1B4332',
          DEFAULT: '#2D6A4F',
          light: '#40916C',
        },
        secondary: {
          DEFAULT: '#95D5B2',
          light: '#B7E4C7',
        },
        background: '#F8FAF6',
        accent: '#D4A373',
        dark: {
          bg: '#121714',
          card: '#1A211D',
          text: '#E8E4D9',
          muted: '#9A9A9A',
        }
      }
    },
  },
  plugins: [],
}
