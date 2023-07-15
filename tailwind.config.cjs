/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'success-badge': '#C0ECDF',
        'homepage-tab-background': "#F4F4FF",
        'primary': '#644DED',
        'primary-light': 'primary/10',
        'border': '#E6E6E6',
        'dark-text': '#484964',
        'light-text': '#242533',
        'light-theme': '#F9F9FC'
      }
    },
  },
  plugins: [],
};

module.exports = config;
