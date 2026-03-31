/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#a855f7',
        'secondary': '#ec4899',
        'dark': '#0f172a',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(168, 85, 247, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(168, 85, 247, 0)',
          },
        },
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
