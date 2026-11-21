import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07080a',
          900: '#0b0c0f',
          850: '#101115',
          800: '#15171c',
          700: '#1d2027',
          600: '#2a2e37',
          500: '#3b404b',
        },
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        verse: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      screens: { '3xl': '1920px' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        blink: { '50%': { opacity: 0 } },
      },
      animation: { rise: 'rise .7s cubic-bezier(.2,.7,.2,1) both', blink: 'blink 1s step-end infinite' },
    },
  },
  plugins: [typography],
};
