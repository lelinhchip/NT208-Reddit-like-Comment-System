/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        reddit: {
          orange: '#FF4500',
          blue: '#0DD3BB',
          dark: '#1A1A1B',
          card: '#272729',
          border: '#343536',
          text: '#D7DADC',
          muted: '#818384',
        },
      },
    },
  },
  plugins: [],
};
