import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zimbabwe: {
          green: '#00A651',
          yellow: '#FDD116',
          red: '#EF3340',
          black: '#000000',
        },
        nyuchi: {
          orange: '#D2691E',
          charcoal: '#36454F',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind reset to avoid conflicts with MUI
  },
}
export default config
