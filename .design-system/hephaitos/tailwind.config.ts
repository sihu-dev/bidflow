import type { Config } from 'tailwindcss'

/**
 * HEPHAITOS Tailwind Configuration
 * Inherited from CATALYST AI + Linear Design
 *
 * Primary: #5E6AD2 (Linear Purple)
 * Background: #0D0D0F
 * Glass: backdrop-blur-xl
 * Accent: #7C8AEA
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
      // Color Palette
      colors: {
        // Primary Brand (Linear Purple)
        primary: {
          DEFAULT: '#5E6AD2',
          50: '#F0F1FA',
          100: '#E0E2F4',
          200: '#C1C5E9',
          300: '#A2A8DE',
          400: '#838BD3',
          500: '#5E6AD2',
          600: '#4B56C8',
          700: '#3A44A8',
          800: '#2D3585',
          900: '#1F2562',
        },
        
        // Accent
        accent: {
          DEFAULT: '#7C8AEA',
          light: '#9BA5F0',
          dark: '#5D6BD8',
          hover: '#8B98EE',
          muted: 'rgba(124, 138, 234, 0.4)',
        },
        
        // Background (Deep Space)
        background: {
          primary: '#0D0D0F',
          secondary: '#111113',
          tertiary: '#161618',
          elevated: '#1A1A1D',
          hover: '#1E1E21',
        },
        
        // Surface
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.02)',
          raised: 'rgba(255, 255, 255, 0.04)',
          overlay: 'rgba(255, 255, 255, 0.06)',
          glass: 'rgba(255, 255, 255, 0.03)',
        },
        
        // Border
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          light: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          focus: '#5E6AD2',
        },
        
        // Status
        success: {
          DEFAULT: '#22C55E',
          bg: 'rgba(34, 197, 94, 0.1)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.1)',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.1)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.1)',
        },
        
        // Trading
        profit: {
          DEFAULT: '#22C55E',
          bg: 'rgba(34, 197, 94, 0.1)',
        },
        loss: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.1)',
        },
      },
      
      // Typography
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      
      // Font Size
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
      },
      
      // Border Radius
      borderRadius: {
        '4xl': '2rem',
      },
      
      // Box Shadow
      boxShadow: {
        'glow-primary': '0 0 20px rgba(94, 106, 210, 0.3)',
        'glow-accent': '0 0 20px rgba(124, 138, 234, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
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
          from: { boxShadow: '0 0 20px rgba(94, 106, 210, 0.2)' },
          to: { boxShadow: '0 0 30px rgba(94, 106, 210, 0.4)' },
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
