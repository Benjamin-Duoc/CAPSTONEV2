/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            },
            colors: {
                'background': '#f8fafc',
                'surface': '#ffffff',
                'primary': '#f97316',
                'secondary': '#3b82f6',
                'accent': '#84cc16',
                'highlight': '#facc15',
                'text-primary': '#1e293b',
                'text-secondary': '#64748b',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.5s ease-out',
            }
        },
    },
    plugins: [],
}
