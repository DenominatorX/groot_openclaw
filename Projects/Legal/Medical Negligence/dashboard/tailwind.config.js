/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#7dd3fc',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        navy: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#bacfff',
          300: '#7fadff',
          400: '#4a87ff',
          500: '#1e5fdc',
          600: '#1e3a5f',
          700: '#162e4d',
          800: '#0f2038',
          900: '#0a1525',
        },
        slate: {
          850: '#1a2535',
        },
        crisis: '#ef4444',
        danger: '#f97316',
        elevated: '#f59e0b',
        normal: '#22c55e',
        defendant: '#dc2626',
        supporting: '#16a34a',
        gold: '#f59e0b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'countUp 1.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
