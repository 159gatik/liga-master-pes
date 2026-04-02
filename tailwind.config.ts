/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // Agregamos src por si tus archivos están ahí
    ],
    theme: {
        extend: {
            fontFamily: {
                bebas: ['var(--font-bebas)'],
                'barlow-condensed': ['var(--font-barlow-cond)'],
                sans: ['var(--font-barlow)'],
            },
        },
    },
    plugins: [],
};