/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Smai IELTS brand — mature, premium IELTS prep
        ink: {
          DEFAULT: '#0d1b2a',
          soft: '#1b2a3d',
        },
        navy: {
          50: '#eef2f8',
          100: '#d7e0ee',
          200: '#aebfdc',
          300: '#7e96c2',
          400: '#5572a6',
          500: '#3a568b',
          600: '#2c426d',
          700: '#243557',
          800: '#1c2942',
          900: '#131d30',
        },
        ember: {
          50: '#fdf3ec',
          100: '#f9dfca',
          200: '#f2bd96',
          300: '#ea9961',
          400: '#e27d38',
          500: '#d4651c',
          600: '#b14f15',
          700: '#8c3d13',
          800: '#673016',
        },
        sand: '#f6f3ee',
        parchment: '#fbfaf7',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,27,42,0.04), 0 8px 24px rgba(13,27,42,0.06)',
        lift: '0 12px 40px rgba(13,27,42,0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
