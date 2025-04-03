/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sohne', 'system-ui', 'sans-serif'],
      },
      colors: {
        mediumText: '#242424',
        mediumSecondary: '#6B6B6B',
        mediumBorder: '#e0e0e0',
      },
    },
  },
  plugins: [],
}; 