/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  safelist: [
    'from-indigo-50', 'from-indigo-100', 'from-amber-50',
    'from-clay', 'from-emerald-50', 'to-indigo-50',
    'to-indigo-100', 'to-amber-50', 'to-clay', 'to-emerald-50'
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink, #0e0f15)',
        darkcard: 'var(--color-darkcard, #161822)',
        porcelain: 'var(--color-porcelain, #FAF6EF)',
        clay: 'var(--color-clay, #E7DFD1)',
        claydark: 'var(--color-claydark, #D8CDB8)',
        indigo: {
          DEFAULT: 'var(--color-indigo, #423F8F)',
          50: '#EFEEFA',
          100: '#DCDAF2',
          400: '#726ECB',
          500: 'var(--color-indigo, #423F8F)',
          600: '#37356F',
          700: '#2A2856'
        },
        amber: {
          DEFAULT: 'var(--color-amber, #E3A23C)',
          50: '#FCF2E1',
          400: 'var(--color-amber-light, #EFB65E)',
          600: '#C87F1F'
        },
        emerald: {
          DEFAULT: 'var(--color-emerald, #1E9A6C)',
          50: '#E7F6EF',
          400: '#38B383',
          600: '#157A54'
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,19,26,0.04), 0 8px 24px -8px rgba(18,19,26,0.10)',
        lift: '0 20px 45px -15px rgba(66,63,143,0.35)'
      },
      borderRadius: { '4xl': '2rem' }
    }
  }
};
