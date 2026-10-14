/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FBF7F2',
          100: '#F5EBDF',
          200: '#E8D3BB',
          300: '#D4B595',
          400: '#B89070',
          500: '#9C6B4A',
          600: '#7E5236',
          700: '#5E3C26',
          800: '#3F2818',
          900: '#26170E',
          950: '#150B07',
        },
        cream: {
          50: '#FFFCF5',
          100: '#FEF7E6',
          200: '#FDEEC1',
          300: '#FBE099',
          400: '#F7CB66',
          500: '#F0B53E',
          600: '#D99525',
          700: '#B0731E',
          800: '#8E5A1D',
          900: '#75491B',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        warm: {
          50: '#FAF7F4',
          100: '#F3ECE2',
          200: '#E5D4BE',
          300: '#D2B493',
          400: '#BC9267',
          500: '#A57849',
          600: '#8A6038',
          700: '#6B482B',
          800: '#4D3320',
          900: '#2F1F13',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        coffee: '0 4px 20px rgba(94, 60, 38, 0.12)',
        'coffee-lg': '0 10px 40px rgba(94, 60, 38, 0.18)',
      },
      backgroundImage: {
        'coffee-gradient':
          'linear-gradient(135deg, #5E3C26 0%, #7E5236 50%, #9C6B4A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
