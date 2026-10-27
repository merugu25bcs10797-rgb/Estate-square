/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF9F6',
          100: '#F4F3EE',
          200: '#E8E6DF',
          300: '#D5D3C9',
          800: '#3D3F3D',
          900: '#262826',
        },
        charcoal: {
          DEFAULT: '#1E232A',
          muted: '#616A79',
          light: '#8E98A8',
          dark: '#14171C'
        },
        forest: {
          DEFAULT: '#166534',
          hover: '#14532D',
          light: '#DCFCE7',
          dark: '#0F3E22'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      aspectRatio: {
        '4/3': '4 / 3',
      }
    },
  },
  plugins: [],
}
