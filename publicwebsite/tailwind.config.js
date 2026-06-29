/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B4F72', light: '#2E86C1', dark: '#154360' },
        accent: { DEFAULT: '#D4AC0D', light: '#F1C40F' },
      },
    },
  },
  plugins: [],
}
