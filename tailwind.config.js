/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Fredoka', 'sans-serif'],
            },
            colors: {
                school: {
                    red: '#b91c1c',
                    green: '#059669',
                    orange: '#d97706',
                    dark: '#1f2937',
                    light: '#f3f4f6',
                }
            }
        },
    },
    plugins: [],
}
