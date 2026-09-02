/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2fb',
          100: '#dbe4f6',
          200: '#b3c6ea',
          300: '#8aa8de',
          400: '#5c85cf',
          500: '#3a63b8',
          600: '#2a4a94',
          700: '#1f3a76', // primary
          800: '#182c59',
          900: '#101d3d',
          950: '#0a1226',
        },
        gold: {
          400: '#e8b84b',
          500: '#d9a52e',
          600: '#b8871f',
        },
        cb: {
          blue: '#0072b2',
          orange: '#d55e00',
          yellow: '#f0e442',
          green: '#009e73',
          purple: '#cc79a7',
          sky: '#56b4e9',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,29,61,0.06), 0 4px 16px rgba(16,29,61,0.06)',
      },
    },
  },
  plugins: [],
}
