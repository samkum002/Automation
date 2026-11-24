/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        automata: {
          blue: '#2563eb',
          purple: '#7c3aed',
          teal: '#0d9488',
          amber: '#d97706',
          rose: '#e11d48',
          slate: '#475569',
        }
      }
    },
  },
  plugins: [],
}
