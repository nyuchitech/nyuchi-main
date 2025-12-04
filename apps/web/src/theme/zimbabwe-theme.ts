/**
 * 🇿🇼 Nyuchi Platform - MUI Theme
 * Nyuchi Brand: Sunset Orange #D2691E, Charcoal #36454F, White
 * Zimbabwe Flag Strip: Green #00A651, Yellow #FDD116, Red #EF3340, Black
 */

export const nyuchiColors = {
  // Nyuchi Brand Colors
  sunsetOrange: '#D2691E',
  charcoal: '#36454F',
  white: '#FFFFFF',

  // Zimbabwe Flag Colors (for flag strip only)
  zimbabweGreen: '#00A651',
  zimbabweYellow: '#FDD116',
  zimbabweRed: '#EF3340',
  zimbabweBlack: '#000000',

  // Neutral colors for Shopify-style admin
  gray50: '#FAFAFA',
  gray100: '#F4F4F5',
  gray200: '#E4E4E7',
  gray300: '#D4D4D8',
  gray400: '#A1A1AA',
  gray500: '#71717A',
  gray600: '#52525B',
  gray700: '#3F3F46',
  gray800: '#27272A',
  gray900: '#18181B',
};

// Zimbabwe flag colors for the flag strip component
export const zimbabweColors = {
  green: '#00A651',
  yellow: '#FDD116',
  red: '#EF3340',
  black: '#000000',
};

export const themeConfig = {
  palette: {
    primary: {
      main: nyuchiColors.sunsetOrange,
      dark: '#B8561A',
      light: '#E08945',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: nyuchiColors.charcoal,
      dark: '#2A3640',
      light: '#4F5D68',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: nyuchiColors.charcoal,
      secondary: nyuchiColors.gray600,
    },
    divider: nyuchiColors.gray200,
  },
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    h1: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 6,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none' as const,
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: `1px solid ${nyuchiColors.gray200}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${nyuchiColors.gray200}`,
          boxShadow: 'none',
        },
      },
    },
  },
};
