/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          1: '#1A0B2E',
          2: '#3B1E54',
          3: '#6D28D9',
        },
        cream: {
          DEFAULT: '#FFF8EC',
          2:       '#FFF3E0',
          3:       '#F5E6CC',
          gold:    '#D4A853',
        },
        purple: {
          deep:  '#1A0B2E',
          mid:   '#3B1E54',
          vivid: '#6D28D9',
          light: '#8B5CF6',
          glow:  '#A78BFA',
          50:    '#F5F3FF',
          100:   '#EDE9FE',
          200:   '#DDD6FE',
          300:   '#C4B5FD',
          400:   '#A78BFA',
          500:   '#8B5CF6',
          600:   '#7C3AED',
          700:   '#6D28D9',
          800:   '#5B21B6',
          900:   '#4C1D95',
          950:   '#3B1E54',
        },
        text: {
          primary:   '#1F2937',
          secondary: '#6B7280',
          muted:     '#9CA3AF',
        },
      },
      backgroundImage: {
        'main-gradient':  'linear-gradient(145deg, #1A0B2E 0%, #3B1E54 45%, #6D28D9 100%)',
        'card-shine':     'linear-gradient(135deg, #FFF8EC 0%, #FFF3E0 100%)',
        'btn-gradient':   'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
        'gold-gradient':  'linear-gradient(135deg, #FFF8EC 0%, #D4A853 50%, #FFF8EC 100%)',
      },
      borderRadius: {
        'card': '20px',
        'btn':  '12px',
      },
      boxShadow: {
        'card':      '0 4px 6px rgba(0,0,0,0.04), 0 10px 30px rgba(109,40,217,0.10)',
        'card-hover':'0 8px 12px rgba(0,0,0,0.06), 0 20px 50px rgba(109,40,217,0.22)',
        'glow':      '0 0 40px rgba(109,40,217,0.50)',
        'glow-sm':   '0 0 20px rgba(109,40,217,0.35)',
        'btn':       '0 4px 20px rgba(109,40,217,0.45)',
      },
      animation: {
        'float':      'float 7s ease-in-out infinite',
        'float-rev':  'floatReverse 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-up':    'fadeInUp 0.6s ease-out both',
        'fade-scale': 'fadeInScale 0.5s ease-out both',
        'shimmer':    'skeleton 1.8s infinite',
        'spin-slow':  'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':     { transform: 'translateY(-16px) rotate(1.5deg)' },
          '66%':     { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        floatReverse: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-20px) rotate(-2deg)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(109,40,217,0.3)' },
          '50%':     { boxShadow: '0 0 45px rgba(109,40,217,0.65)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        skeleton: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
