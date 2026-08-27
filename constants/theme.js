export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const typography = {
  size: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 34 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { xs: 16, sm: 20, md: 24, lg: 26, xl: 28, xxl: 34, display: 40 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
};

const lightColors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',
  border: '#E2E5EA',
  textPrimary: '#12151A',
  textSecondary: '#5B6470',
  textTertiary: '#8A93A0',
  primary: '#2F6FED',
  primarySoft: '#E4ECFD',
  primaryText: '#FFFFFF',
  secondary: '#5B6470',
  secondarySoft: '#E9EBEF',
  danger: '#E5484D',
  dangerSoft: '#FBE4E4',
  dangerText: '#FFFFFF',
  success: '#1FA97D',
  successSoft: '#DFF5EC',
  warning: '#F2A93B',
  warningSoft: '#FCEED9',
  overlay: 'rgba(15, 17, 21, 0.5)',
};

const darkColors = {
  background: '#0B0D10',
  surface: '#15181D',
  surfaceAlt: '#1D2127',
  border: '#282D35',
  textPrimary: '#F4F6F8',
  textSecondary: '#9AA3AF',
  textTertiary: '#6B7280',
  primary: '#5B8DEF',
  primarySoft: '#1C2B4D',
  primaryText: '#FFFFFF',
  secondary: '#9AA3AF',
  secondarySoft: '#242830',
  danger: '#FF6B6B',
  dangerSoft: '#3B1E20',
  dangerText: '#FFFFFF',
  success: '#33C58E',
  successSoft: '#1B3A2E',
  warning: '#F5B95B',
  warningSoft: '#3D2F17',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const theme = {
  light: lightColors,
  dark: darkColors,
};
