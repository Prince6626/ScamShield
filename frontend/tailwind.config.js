/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          cyber: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#083344',
          },
          dark: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            850: '#172033',
            900: '#0f172a',
            950: '#020617',
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        },
        animation: {
          'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
          'scan-line': 'scan-line 2s linear infinite',
          'float': 'float 3s ease-in-out infinite',
          'shimmer': 'shimmer 2s linear infinite',
        },
        keyframes: {
          'pulse-glow': {
            '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
            '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
          },
          'scan-line': {
            '0%': { transform: 'translateY(-100%)' },
            '100%': { transform: 'translateY(100%)' },
          },
          'float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          'shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        },
        backgroundImage: {
          'grid-pattern': 'linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)',
        },
        backgroundSize: {
          'grid': '40px 40px',
        },
      },
    },
    plugins: [],
  }
