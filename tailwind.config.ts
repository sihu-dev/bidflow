import type { Config } from 'tailwindcss'

/**
 * BIDFLOW Tailwind Configuration
 * Monochrome Design System
 *
 * Primary: #171717 (neutral-900)
 * Background: #FFFFFF / #FAFAFA
 * Clean, minimal, professional
 */

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Color Palette (Light Theme)
      colors: {
        // Primary Brand (Monochrome - Black/Gray)
        primary: {
          DEFAULT: '#171717',  // neutral-900
          50: '#fafafa',       // neutral-50
          100: '#f5f5f5',      // neutral-100
          200: '#e5e5e5',      // neutral-200
          300: '#d4d4d4',      // neutral-300
          400: '#a3a3a3',      // neutral-400
          500: '#737373',      // neutral-500
          600: '#525252',      // neutral-600
          700: '#404040',      // neutral-700
          800: '#262626',      // neutral-800
          900: '#171717',      // neutral-900
        },

        // Accent (Monochrome - Darker grays for highlights)
        accent: {
          DEFAULT: '#525252',   // neutral-600
          light: '#737373',     // neutral-500
          dark: '#262626',      // neutral-800
          hover: '#404040',     // neutral-700
          muted: 'rgba(23, 23, 23, 0.08)',  // neutral-900 8% opacity
        },

        // Background (Light)
        background: {
          primary: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
          elevated: '#FFFFFF',
          hover: '#F5F5F5',
        },

        // Surface
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.02)',
          glass: 'rgba(255, 255, 255, 0.8)',
        },

        // Border (Light theme)
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F5F5F5',
          medium: '#D4D4D4',
          focus: '#4F46E5',
        },

        // Status
        success: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.08)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.08)',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.08)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.08)',
        },
      },
      
      // Typography
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      
      // Font Size
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
      },
      
      // Border Radius
      borderRadius: {
        '4xl': '2rem',
      },
      
      // Box Shadow (Light Theme - Subtle)
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'glow-primary': '0 0 20px rgba(23, 23, 23, 0.12)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      
      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.15s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      
      // Keyframes
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          from: { opacity: '0', transform: 'translateX(10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(23, 23, 23, 0.08)' },
          to: { boxShadow: '0 0 30px rgba(23, 23, 23, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      
      // Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Transition Duration
      transitionDuration: {
        '400': '400ms',
      },
      
      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Width
      width: {
        '88': '22rem',
        '128': '32rem',
      },
      
      // Max Width
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
}

export default config
