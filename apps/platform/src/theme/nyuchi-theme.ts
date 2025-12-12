/**
 * Nyuchi Brand System V5.3 - React Native Paper Theme
 *
 * NYUCHI BRAND:
 * - Primary: Sunset Deep #D4634A
 * - Secondary: Navy Blue #1E3A8A
 * - Accent: Purple #7C73E6
 *
 * Typography:
 * - Display/H1: Noto Serif (400, 700)
 * - Headings H2-H6 & Body: Plus Jakarta Sans (300-700)
 *
 * Design Tokens:
 * - Button radius: 8px
 * - Card radius: 12px
 * - Badge: pill (9999px)
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Brand Colors
export const nyuchiColors = {
  // Nyuchi Brand (Primary Palette)
  sunsetDeep: '#D4634A',
  navy: '#1E3A8A',
  purple: '#7C73E6',

  // Developer Platform Palette
  platform: {
    navy: '#0f172a',      // Slate 900 - Deep Background
    surface: '#1e293b',   // Slate 800 - Cards
    surfaceAlt: '#334155', // Slate 700 - Alt cards
    accent: '#38bdf8',    // Sky 400 - Tech Glow
    border: '#334155',    // Slate 700
    borderLight: '#475569', // Slate 600
  },

  // Supporting Colors
  green: '#10B981',       // Emerald 500 - Status Good
  greenDark: '#34D399',   // Emerald 400
  gold: '#F59E0B',        // Amber 500 - Heritage
  blue: '#6B8ECD',
  blueDark: '#8BA5D8',

  // Zimbabwe Flag Strip Colors
  flagGreen: '#729B63',
  flagYellow: '#FDD116',
  flagRed: '#EF3340',
  flagBlack: '#2B2B2B',

  // Light Mode Surfaces
  light: {
    background: '#FAF9F5',
    card: '#FFFFFF',
    border: '#E8E8E8',
    text: '#141413',
    textSecondary: '#52525B',
  },

  // Dark Mode Surfaces (Platform Style)
  dark: {
    background: '#0f172a',  // Slate 900
    card: '#1e293b',        // Slate 800
    border: '#334155',      // Slate 700
    text: '#f1f5f9',        // Slate 100
    textSecondary: '#94a3b8', // Slate 400
  },
};

// Spacing tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius tokens
export const borderRadius = {
  button: 8,
  card: 12,
  input: 8,
  badge: 9999, // pill
};

// Shadow tokens (Claude/Anthropic-inspired soft shadows)
export const shadows = {
  sm: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 16,
  },
  card: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  button: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonHover: {
    shadowColor: '#141413',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};

// Font configuration for React Native Paper
const fontConfig = {
  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
};

// Type scale
export const typeScale = {
  display: {
    fontSize: 72,
    lineHeight: 79,
    fontFamily: 'Noto Serif, Georgia, serif',
    fontWeight: '700' as const,
  },
  h1: {
    fontSize: 48,
    lineHeight: 58,
    fontFamily: 'Noto Serif, Georgia, serif',
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 36,
    lineHeight: 43,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '700' as const,
  },
  h4: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600' as const,
  },
  h5: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600' as const,
  },
  h6: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 32,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600' as const,
  },
};

// Light theme
export const nyuchiLightTheme: MD3Theme = {
  ...MD3LightTheme,
  dark: false,
  roundness: borderRadius.button,
  colors: {
    ...MD3LightTheme.colors,
    primary: nyuchiColors.sunsetDeep,
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFE5DF',
    onPrimaryContainer: nyuchiColors.sunsetDeep,
    secondary: nyuchiColors.navy,
    onSecondary: '#FFFFFF',
    secondaryContainer: '#D6E3FF',
    onSecondaryContainer: nyuchiColors.navy,
    tertiary: nyuchiColors.purple,
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E8E6FF',
    onTertiaryContainer: nyuchiColors.purple,
    background: nyuchiColors.light.background,
    onBackground: nyuchiColors.light.text,
    surface: nyuchiColors.light.card,
    onSurface: nyuchiColors.light.text,
    surfaceVariant: '#F5F4F0',
    onSurfaceVariant: nyuchiColors.light.textSecondary,
    outline: nyuchiColors.light.border,
    outlineVariant: '#E8E8E8',
    error: '#DC2626',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',
    inverseSurface: nyuchiColors.dark.card,
    inverseOnSurface: nyuchiColors.dark.text,
    inversePrimary: '#FF9A85',
    elevation: {
      level0: 'transparent',
      level1: nyuchiColors.light.card,
      level2: nyuchiColors.light.card,
      level3: nyuchiColors.light.card,
      level4: nyuchiColors.light.card,
      level5: nyuchiColors.light.card,
    },
    surfaceDisabled: 'rgba(20, 20, 19, 0.12)',
    onSurfaceDisabled: 'rgba(20, 20, 19, 0.38)',
    backdrop: 'rgba(20, 20, 19, 0.4)',
    shadow: '#141413',
    scrim: '#141413',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Dark theme
export const nyuchiDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: borderRadius.button,
  colors: {
    ...MD3DarkTheme.colors,
    primary: nyuchiColors.sunsetDeep,
    onPrimary: '#FFFFFF',
    primaryContainer: '#5C2A1F',
    onPrimaryContainer: '#FFB4A3',
    secondary: '#93B4FF',
    onSecondary: '#002D6D',
    secondaryContainer: '#0D3F8C',
    onSecondaryContainer: '#D6E3FF',
    tertiary: '#C5BFFF',
    onTertiary: '#2D2578',
    tertiaryContainer: '#443C90',
    onTertiaryContainer: '#E8E6FF',
    background: nyuchiColors.dark.background,
    onBackground: nyuchiColors.dark.text,
    surface: nyuchiColors.dark.card,
    onSurface: nyuchiColors.dark.text,
    surfaceVariant: '#2A2A29',
    onSurfaceVariant: nyuchiColors.dark.textSecondary,
    outline: nyuchiColors.dark.border,
    outlineVariant: '#3D3D3C',
    error: '#F87171',
    onError: '#7F1D1D',
    errorContainer: '#991B1B',
    onErrorContainer: '#FEE2E2',
    inverseSurface: nyuchiColors.light.card,
    inverseOnSurface: nyuchiColors.light.text,
    inversePrimary: nyuchiColors.sunsetDeep,
    elevation: {
      level0: 'transparent',
      level1: nyuchiColors.dark.card,
      level2: '#222221',
      level3: '#2A2A29',
      level4: '#2E2E2D',
      level5: '#343433',
    },
    surfaceDisabled: 'rgba(250, 249, 245, 0.12)',
    onSurfaceDisabled: 'rgba(250, 249, 245, 0.38)',
    backdrop: 'rgba(20, 20, 19, 0.6)',
    shadow: '#000000',
    scrim: '#000000',
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Asset URLs
export const assets = {
  logo: {
    light: 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_light.svg',
    dark: 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_dark.svg',
  },
  favicon: 'https://assets.nyuchi.com/logos/Nyuchi_Logo_Favicon.ico',
  css: {
    all: 'https://assets.nyuchi.com/css/v5/all.css',
    fonts: 'https://assets.nyuchi.com/fonts/all-fonts.css',
  },
  fonts: {
    google: 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
  },
};

// Default export
const nyuchiTheme = {
  light: nyuchiLightTheme,
  dark: nyuchiDarkTheme,
  colors: nyuchiColors,
  spacing,
  borderRadius,
  shadows,
  typeScale,
  assets,
};

export default nyuchiTheme;
