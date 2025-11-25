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
                    red: '#dc2626',
                    green: '#16a34a',
                    orange: '#f97316',
                    dark: '#1f2937',
                    light: '#f3f4f6',
                }
            }
        },
    },
    plugins: [],
}
