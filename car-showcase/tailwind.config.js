/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#ccff00',
          hover: '#b8e600',
          glow: 'rgba(204, 255, 0, 0.35)',
        },
        dark: {
          950: '#000000',
          900: '#080808',
          850: '#0f0f0f',
          800: '#171717',
          700: '#262626',
          600: '#383838',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.45)',
        'accent-glow': '0 0 30px rgba(204, 255, 0, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
