/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aadhaar: {
          orange: '#F37021',
          red: '#E03A3E',
          blue: '#1A3C6E',
          dark: '#0F1724',
          surface: '#151D2E',
          card: '#1C2640',
          border: '#2A3654',
          accent: '#F37021',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
