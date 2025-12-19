import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './bidflow/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        success: { 50: '#F0FDF4', 500: '#22C55E', 600: '#16A34A' },
        warning: { 50: '#FFFBEB', 500: '#F59E0B', 600: '#D97706' },
        error: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' },
        surface: { DEFAULT: '#FFFFFF', secondary: '#F9FAFB', tertiary: '#F3F4F6' },
        border: { DEFAULT: '#E5E7EB', secondary: '#D1D5DB' },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
