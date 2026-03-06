/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#edf1f8',
                    100: '#dce4f1',
                    200: '#b9c9e3',
                    300: '#96aed5',
                    400: '#7393c7',
                    500: '#5078b9',
                    600: '#31529A', // Base CFC Blue
                    700: '#27427b',
                    800: '#1e315c',
                    900: '#14213e',
                    950: '#0a101f',
                },
                primary: {
                    50: '#fef6e5',
                    100: '#fdf0cc',
                    200: '#fbe199',
                    300: '#f9d266',
                    400: '#f8c333',
                    500: '#F6A900', // Base CFC Yellow
                    600: '#c58700',
                    700: '#946500',
                    800: '#624400',
                    900: '#312200',
                    950: '#181100',
                },
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#3F9FFF', // Light Blue Accent from CFC
                    600: '#2b82d9',
                    700: '#1c66b3',
                },
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0,0,0,0.05)',
                'card': '0 2px 10px rgba(0,0,0,0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
