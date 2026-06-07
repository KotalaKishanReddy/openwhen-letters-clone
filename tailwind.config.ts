import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        cream:  '#fdf8f3',
        beige:  '#f5ede0',
        brown:  { DEFAULT: '#3d2c1e', light: '#7a5c44' },
        blush:  { DEFAULT: '#f9dde0', dark: '#e88fa0' },
        butter: { DEFAULT: '#fef3c7', dark: '#d97706' },
        lavender: { DEFAULT: '#ede9fe', dark: '#7c3aed' },
        sage:   { DEFAULT: '#d1fae5', dark: '#065f46' }
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 4px 24px rgba(61,44,30,.10)',
        lift: '0 12px 36px rgba(61,44,30,.14)'
      }
    }
  },
  plugins: []
}

export default config
