/**
 * 🇿🇼 Zimbabwe Theme Configuration
 * Flag colors and cultural design elements
 */

/**
 * Zimbabwe flag colors (official)
 */
export const zimbabweColors = {
  green: '#00A651', // Green stripe - agriculture, fertility
  yellow: '#FDD116', // Yellow stripe - mineral wealth
  red: '#EF3340', // Red stripe - blood shed for independence
  black: '#000000', // Black - the African people
  white: '#FFFFFF', // White triangle - peace
  star: {
    red: '#EF3340', // Red star
    yellow: '#FDD116', // Yellow bird
  },
} as const;

/**
 * Typography configuration
 */
export const zimbabweTypography = {
  heading: {
    fontFamily: 'Playfair Display, serif',
    weight: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  body: {
    fontFamily: 'Roboto, sans-serif',
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
} as const;

/**
 * Border radius for pill-shaped buttons
 */
export const zimbabweBorderRadius = {
  button: '9999px', // Pill-shaped (fully rounded)
  card: '8px',
  input: '4px',
} as const;

/**
 * Flag strip configuration
 */
export const zimbabweFlagStrip = {
  width: '8px',
  position: 'fixed' as const,
  left: 0,
  top: 0,
  height: '100vh',
  zIndex: 9999,
  stripes: [
    { color: zimbabweColors.green, flex: 1 },
    { color: zimbabweColors.yellow, flex: 1 },
    { color: zimbabweColors.red, flex: 1 },
    { color: zimbabweColors.black, flex: 1 },
  ],
} as const;

/**
 * Material UI theme colors mapping
 */
export const getMUIThemeColors = () => ({
  primary: {
    main: zimbabweColors.green,
    light: '#4CAF50',
    dark: '#2E7D32',
    contrastText: '#ffffff',
  },
  secondary: {
    main: zimbabweColors.yellow,
    light: '#FFD54F',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  error: {
    main: zimbabweColors.red,
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#ffffff',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#ffffff',
  },
  success: {
    main: zimbabweColors.green,
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#ffffff',
  },
  warning: {
    main: zimbabweColors.yellow,
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
});

/**
 * CSS variables for Zimbabwe theme
 */
export const zimbabweCSSVariables = {
  '--zimbabwe-green': zimbabweColors.green,
  '--zimbabwe-yellow': zimbabweColors.yellow,
  '--zimbabwe-red': zimbabweColors.red,
  '--zimbabwe-black': zimbabweColors.black,
  '--zimbabwe-white': zimbabweColors.white,
  '--font-heading': zimbabweTypography.heading.fontFamily,
  '--font-body': zimbabweTypography.body.fontFamily,
  '--button-radius': zimbabweBorderRadius.button,
  '--card-radius': zimbabweBorderRadius.card,
} as const;

/**
 * Get flag strip JSX styles
 */
export function getFlagStripStyles() {
  return {
    container: {
      position: 'fixed' as const,
      left: 0,
      top: 0,
      width: zimbabweFlagStrip.width,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      zIndex: zimbabweFlagStrip.zIndex,
    },
    stripe: (color: string) => ({
      flex: 1,
      backgroundColor: color,
    }),
  };
}

/**
 * Tailwind CSS classes for Zimbabwe theme
 */
export const zimbabweTailwindClasses = {
  colors: {
    green: 'bg-[#00A651] text-white',
    yellow: 'bg-[#FDD116] text-black',
    red: 'bg-[#EF3340] text-white',
    black: 'bg-[#000000] text-white',
  },
  buttons: {
    primary: 'rounded-full bg-[#00A651] text-white hover:bg-[#2E7D32]',
    secondary: 'rounded-full bg-[#FDD116] text-black hover:bg-[#F57C00]',
    error: 'rounded-full bg-[#EF3340] text-white hover:bg-[#D32F2F]',
  },
  text: {
    heading: 'font-["Playfair_Display",serif]',
    body: 'font-["Roboto",sans-serif]',
  },
} as const;

/**
 * Get responsive flag strip (hide on mobile if needed)
 */
export function getResponsiveFlagStripStyles(hideMobile = false) {
  const baseStyles = getFlagStripStyles();

  if (hideMobile) {
    return {
      ...baseStyles,
      container: {
        ...baseStyles.container,
        '@media (max-width: 768px)': {
          display: 'none',
        },
      },
    };
  }

  return baseStyles;
}
