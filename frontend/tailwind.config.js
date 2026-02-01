/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        basil: {
          50: '#f2fbf4',
          100: '#daf3e1',
          200: '#b1e6c4',
          300: '#7bd1a0',
          400: '#4ab57d',
          500: '#249a63',
          600: '#168053',
          700: '#136645',
          800: '#11513a',
          900: '#0d3f2f'
        },
        tomato: {
          50: '#fff1f0',
          100: '#ffd9d6',
          200: '#ffb3ad',
          300: '#ff857a',
          400: '#ff5a4a',
          500: '#f23b2f',
          600: '#d92820',
          700: '#b21e19',
          800: '#8b1916',
          900: '#6e1514'
        },
        crema: '#f7f1e8',
        ink: '#1f1e1c'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 12px 40px rgba(0,0,0,0.12)'
      }
    }
  },
  plugins: []
};
