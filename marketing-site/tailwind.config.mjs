/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nyuchi Brand Colors
        nyuchi: {
          orange: '#D2691E',
          'orange-dark': '#B8561A',
          'orange-light': '#E08945',
          charcoal: '#36454F',
          'charcoal-dark': '#2A3640',
          'charcoal-light': '#4F5D68',
        },
        // Zimbabwe Flag Colors
        zimbabwe: {
          green: '#00A651',
          yellow: '#FDD116',
          red: '#EF3340',
          black: '#000000',
        },
        // Gray scale
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
