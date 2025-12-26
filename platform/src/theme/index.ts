/**
 * Nyuchi Platform Brand System v6
 * Five African Minerals Palette - Nyuchi Platform Variant
 * Primary: Gold | Secondary: Malachite | Accent: Terracotta
 *
 * Hierarchy: All 7 brands use the same 5 minerals with different primary/secondary/accent.
 * Nyuchi Platform = Gold primary, Malachite secondary, Terracotta accent
 *
 * Note: These values mirror the Tailwind config and CSS variables.
 * Use Tailwind classes when possible. These constants are for JS logic.
 */

// Five African Minerals - WCAG AAA Compliant (7:1+)
export const minerals = {
  cobalt: {
    light: '#0047AB',
    dark: '#00B0FF',
    description: 'Katanga/Zambian Copperbelt - Education brand primary',
  },
  tanzanite: {
    light: '#4B0082',
    dark: '#B388FF',
    description: 'Merelani Hills, Tanzania - Mukoko/Social brand primary',
  },
  malachite: {
    light: '#004D40',
    dark: '#64FFDA',
    description: 'Congo Copper Belt - Success states, Travel brand primary',
  },
  gold: {
    light: '#5D4037',
    dark: '#FFD740',
    description: 'Ghana, South Africa, Mali - Nyuchi Platform primary',
  },
  terracotta: {
    light: '#8B4513',
    dark: '#D4A574',
    description: 'Pan-African Earth - Community/Ubuntu, Bundu Family primary',
  },
} as const

// Nyuchi Platform Brand Colors
export const nyuchiPlatform = {
  primary: minerals.gold,
  secondary: minerals.malachite,
  accent: minerals.terracotta,
} as const

// Zimbabwe Flag Colors (Heritage Strip - 4px vertical left edge)
export const zimbabwe = {
  green: '#00A651',
  yellow: '#FDD116',
  red: '#D4634A',
  black: '#171717',
} as const

// Surface Colors
export const surfaces = {
  light: {
    background: '#FAF9F5', // Warm Cream
    elevated: '#FFFFFF',
    dim: '#F3F2EE',
  },
  dark: {
    background: '#0A0A0A', // Charcoal
    elevated: '#141414',
    card: '#1E1E1E',
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

// Design Tokens v6
export const tokens = {
  radius: {
    button: 12,    // All buttons - NOT 8px
    card: 16,      // Generous cards
    input: 8,      // Form fields
    badge: 9999,   // Pill-shaped
    icon: 24,      // App icons
  },
  flagStrip: {
    width: 4,      // Vertical left edge
  },
  touchTarget: {
    min: 44,       // WCAG 2.2 AAA minimum
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

// Semantic Colors (mapped to minerals)
export const semantic = {
  success: minerals.malachite,
  info: minerals.cobalt,
  warning: '#7A5C00',
  error: '#B3261E',
} as const

// Default export
const theme = {
  minerals,
  nyuchiPlatform,
  zimbabwe,
  surfaces,
  text,
  tokens,
  assets,
  semantic,
}

export default theme
