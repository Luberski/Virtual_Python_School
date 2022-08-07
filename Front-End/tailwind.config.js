/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/components/**/*.{ts,tsx,js,jsx}',
    './src/pages/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    fontFamily: {
      display: ['Montserrat', 'system-ui', 'sans-serif'],
      body: ['Montserrat', 'system-ui', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
