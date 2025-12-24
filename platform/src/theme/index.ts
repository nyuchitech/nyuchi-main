/**
 * Nyuchi Brand System v6
 * Five African Minerals Palette
 *
 * Primary: Mineral colors from across Africa
 * Heritage: Zimbabwe flag strip (4px vertical left edge)
 * Accessibility: WCAG AAA (7:1+) compliant
 *
 * Note: These values mirror the Tailwind config and CSS variables.
 * Use Tailwind classes when possible. These constants are for JS logic.
 */

// Five African Minerals - WCAG AAA Compliant
export const minerals = {
  cobalt: {
    light: '#0047AB',
    dark: '#00B0FF',
    description: 'Katanga/Zambian Copperbelt - Primary actions',
  },
  tanzanite: {
    light: '#4B0082',
    dark: '#B388FF',
    description: 'Merelani Hills, Tanzania - Secondary/premium',
  },
  malachite: {
    light: '#004D40',
    dark: '#64FFDA',
    description: 'Congo Copper Belt - Success states',
  },
  gold: {
    light: '#5D4037',
    dark: '#FFD740',
    description: 'Ghana, South Africa, Mali - Highlights/emphasis',
  },
  terracotta: {
    light: '#8B4513',
    dark: '#D4A574',
    description: 'Pan-African Earth - Warm accents',
  },
} as const

// Zimbabwe Flag Colors
export const zimbabwe = {
  green: '#00A651',
  yellow: '#FDD116',
  red: '#D4634A',
  black: '#171717',
} as const

// Surface Colors
export const surfaces = {
  light: {
    background: '#FAF9F5', // cream
    elevated: '#FFFFFF',
  },
  dark: {
    background: '#0A0A0A', // charcoal
    elevated: '#1E1E1E',
  },
} as const

// Text Colors
export const text = {
  light: {
    primary: '#0A0A0A',
    secondary: '#525252',
    tertiary: '#737373',
  },
  dark: {
    primary: '#FAFAFA',
    secondary: '#A3A3A3',
    tertiary: '#737373',
  },
} as const

// Design Tokens
export const tokens = {
  radius: {
    button: 12,
    card: 16,
    input: 8,
    badge: 9999,
    icon: 24,
  },
  flagStrip: {
    width: 4,
  },
} as const

// Asset URLs
export const assets = {
  logo: {
    light: 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_light.svg',
    dark: 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_dark.svg',
  },
  favicon: 'https://assets.nyuchi.com/logos/Nyuchi_Logo_Favicon.ico',
} as const

// Default export
const theme = {
  minerals,
  zimbabwe,
  surfaces,
  text,
  tokens,
  assets,
}

export default theme
