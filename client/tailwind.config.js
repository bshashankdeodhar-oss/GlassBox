/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'glass-bg': '#0a0a0a',
        'glass-border': 'rgba(255, 255, 255, 0.145)',
        'accent-blue': '#52a8ff',
        'accent-green': '#62c073',
        'accent-rose': '#f43f5e',
        'accent-amber': '#f59e0b',
        'text-muted': '#999999',
      },
    },
  },
  plugins: [],
};
