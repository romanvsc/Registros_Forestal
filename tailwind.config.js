/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        malachite: {
          50: '#c6fecd',
          100: '#1fab1f',
          400: '#0b6622',
        },
        'red-ribbon': {
          50: '#ff0044',
        },
        'golden-fizz': {
          50: '#ffff44',
          100: '#121200',
        },
      },
    },
  },
  plugins: [],
}
