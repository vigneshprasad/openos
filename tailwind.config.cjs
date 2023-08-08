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
                'light-grey': '#999999',
                // NEW COLOURS START HERE
                'accent-colour': '#6868F7',
                'accent-colour-dark': '#5353C6',
                'border-colour': '#E9ECEF',
                'page-background-colour': "#FCFDFE",
                'button-active-state': '#F1F3F5',
                'blue-card-background-colour': '#EEEEFE',
                'blue-card-border-colour': '#A7A7FA',
                'table-heading-background-colour': '#F7F8F9',
                'light-grey-background-colour': '#EFF1F3',
                'lighter-grey-background-colour': '#F8F9FA',
                //TEXT COLOURS
                'light-text-colour': '#495057',
                'light-grey-text-colour': '#AEB3B8',
                'dark-grey-text-colour': '#868E96',
                'dark-text-colour': '#0D131B',
                'green-text-colour': '#38A169',
                'red-text-colour': '#E53E3E',
            }
        },
        fontFamily: {
            'sans': ['Inter', 'sans-serif'],
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '4rem',
            '7xl': '4.5rem',
            '8xl': '6rem',
            '9xl': '8rem',
        }
    },
    plugins: [],
};

module.exports = config;
