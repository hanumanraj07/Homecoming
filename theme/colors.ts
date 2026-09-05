// Shared design tokens for Homecoming app
// Import this file in each screen for consistent styling
//
// Palette: warm, illustrated "travel app" look — olive green + cream + orange accent,
// flat pastel tints behind illustrated icons. No dark mode; this is a light theme by design.

import { StyleSheet, Dimensions } from 'react-native';

export const COLORS = {
  // Primary brand — moss/olive green (used for the hero illustration, headings, active states)
  primary: '#5C7A3D',
  primaryDark: '#43592C',
  primaryLight: '#8FAE68',

  // Accent — the orange used on every primary call-to-action button
  accent: '#F2884B',
  accentDark: '#D96F35',

  // Semantic
  success: '#4C9A5B',
  danger: '#E4572E',
  warning: '#E0A339',

  // Background — cream/off-white, not stark white
  bg: '#FAF7F0',
  bgCard: '#FFFFFF',
  bgCardLight: '#FFFDF9',
  bgElevated: '#F2EEE3',

  // Text
  textPrimary: '#26291F',
  textSecondary: '#767A6B',
  textMuted: '#A6A995',

  // Borders
  border: '#E8E3D5',
  borderLight: '#F0ECE0',

  // Pastel tints for illustrated category/feature icons
  tintGreen: '#DCE8C8',
  tintBlue: '#D6E9EA',
  tintOrange: '#FBE0C7',
  tintYellow: '#F5EAC2',
};

export const FONTS = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOW = {
  small: {
    shadowColor: '#26291F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#26291F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: '#26291F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
