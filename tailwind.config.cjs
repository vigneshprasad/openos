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
        'light-theme': '#F9F9FC',
        'subtext': '#808192',
        'predicted-churn-background': '#ECEBF9',
        'actual-churn-background': '#C0ECDF',
        'total-users-background': '#F8CCD4',
        'section-header': '#EFEFF5',
        'highlight': '#B5E5F4',
        'disabled': '#B4B4B4',
        'beta-background': '#F4E3B5',
        'light-grey': '#999999'
      }
    },
  },
  plugins: [],
};

module.exports = config;
