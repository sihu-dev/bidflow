/**
 * BIDFLOW Design Tokens
 * Google DeepMind-inspired Light Theme
 * Clean, transparent, minimal design
 *
 * @version 2.0.0
 * @date 2025-12-21
 */

export const colors = {
  // Primary Brand (Deep Blue - DeepMind inspired)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#4F46E5', // Main primary
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#1E1B4B',
  },

  // Neutral (Clean grays)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Status colors (subtle)
  status: {
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.08)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.08)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.08)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.08)',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.15' }],
    '6xl': ['3.75rem', { lineHeight: '1.1' }],
    '7xl': ['4.5rem', { lineHeight: '1.05' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  section: {
    sm: '4rem', // 64px
    md: '6rem', // 96px
    lg: '8rem', // 128px
  },
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export const shadows = {
  // Subtle shadows for light theme
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
  // Glow effects
  glow: {
    primary: '0 0 20px rgba(79, 70, 229, 0.15)',
    success: '0 0 20px rgba(16, 185, 129, 0.15)',
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.625rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Design token exports for components
export const tokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animation,
} as const;

export default tokens;
