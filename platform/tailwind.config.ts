import type { Config } from 'tailwindcss'

/**
 * Nyuchi Platform Brand System v6
 * Five African Minerals Palette - Nyuchi Platform Variant
 * Primary: Gold | Secondary: Malachite | Accent: Terracotta
 * Ubuntu Philosophy: "Ndiri nekuti tiri" (I am because we are)
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Five African Minerals - WCAG AAA (7:1+) compliant
        mineral: {
          // Cobalt - Katanga (DRC), Zambian Copperbelt - Education brand primary
          cobalt: {
            light: '#0047AB',
            dark: '#00B0FF',
            DEFAULT: 'var(--mineral-cobalt)',
          },
          // Tanzanite - Merelani Hills, Tanzania - Mukoko/Social brand primary
          tanzanite: {
            light: '#4B0082',
            dark: '#B388FF',
            DEFAULT: 'var(--mineral-tanzanite)',
          },
          // Malachite - Congo Copper Belt - Travel brand primary, Success states
          malachite: {
            light: '#004D40',
            dark: '#64FFDA',
            DEFAULT: 'var(--mineral-malachite)',
          },
          // Gold - Ghana, South Africa, Mali - NYUCHI PLATFORM PRIMARY
          gold: {
            light: '#5D4037',
            dark: '#FFD740',
            DEFAULT: 'var(--mineral-gold)',
          },
          // Terracotta - Pan-African Earth - Community/Ubuntu, Bundu Family primary
          terracotta: {
            light: '#8B4513',
            dark: '#D4A574',
            DEFAULT: 'var(--mineral-terracotta)',
          },
        },

        // Zimbabwe Flag Colors (Heritage Strip)
        zimbabwe: {
          green: '#00A651',
          yellow: '#FDD116',
          red: '#D4634A',
          black: '#171717',
        },

        // Surface Colors
        surface: {
          cream: '#FAF9F5',
          charcoal: '#0A0A0A',
          elevated: '#141414',
          card: '#1E1E1E',
          dim: '#F3F2EE',
        },

        // shadcn/ui CSS variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // Design Tokens v6 - DO NOT CHANGE
      borderRadius: {
        button: '12px',   // All buttons - NOT 8px
        card: '16px',     // Generous cards
        input: '8px',     // Form fields
        badge: '9999px',  // Pill-shaped
        icon: '24px',     // App icons
        // shadcn compatibility
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Typography
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Flag strip width
      spacing: {
        'flag-strip': '4px',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
