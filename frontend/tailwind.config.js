/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette - Deep Ocean Blue
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd7ff',
          300: '#8ebeff',
          400: '#599aff',
          500: '#3374ff',
          600: '#1a4ff5',
          700: '#133ae1',
          800: '#1630b6',
          900: '#182e8f',
          950: '#121d57',
        },
        // Secondary palette - Electric Violet
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d4ff',
          300: '#d8b1ff',
          400: '#c17fff',
          500: '#a855f7',
          600: '#9133ea',
          700: '#7a1dce',
          800: '#661ba8',
          900: '#541988',
          950: '#360764',
        },
        // Accent palette - Cyber Teal
        accent: {
          50: '#effefb',
          100: '#c7fff4',
          200: '#90ffea',
          300: '#51f7dc',
          400: '#1de4c8',
          500: '#04c8ae',
          600: '#00a18f',
          700: '#058074',
          800: '#0a655e',
          900: '#0d544e',
          950: '#003331',
        },
        // Status colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Dark theme surface colors
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#1f1f23',
          850: '#18181b',
          900: '#111113',
          950: '#09090b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(51, 116, 255, 0.3)',
        'glow-accent': '0 0 20px rgba(4, 200, 174, 0.3)',
        'glow-secondary': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-error': '0 0 25px rgba(239, 68, 68, 0.4)',
        'glow-warning': '0 0 25px rgba(245, 158, 11, 0.4)',
        'glow-success': '0 0 25px rgba(34, 197, 94, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(51, 116, 255, 0.1)',
      },
      animation: {
        // Existing animations
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        
        // New: Ping variations (slower)
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-slower': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        
        // New: Pulse variations (slower)
        'pulse-slower': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // New: Wave animations for status indicators
        'wave-error': 'wave-error 2.5s ease-in-out infinite',
        'wave-warning': 'wave-warning 2s ease-in-out infinite',
        'wave-success': 'wave-success 3s ease-in-out infinite',
        'wave-connecting': 'wave-connecting 1.5s ease-in-out infinite',
        
        // New: Ripple effect (nice for errors)
        'ripple': 'ripple 2s ease-out infinite',
        'ripple-slow': 'ripple 3s ease-out infinite',
        
        // New: Glow pulse for nodes
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'glow-pulse-error': 'glow-pulse-error 2s ease-in-out infinite',
      },
      keyframes: {
        // Existing keyframes
        flow: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        
        // New: Wave keyframes for different statuses
        'wave-error': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.4',
          },
          '50%': { 
            transform: 'scale(1.2)', 
            opacity: '0.1',
          },
        },
        'wave-warning': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.35',
          },
          '50%': { 
            transform: 'scale(1.15)', 
            opacity: '0.1',
          },
        },
        'wave-success': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.25',
          },
          '50%': { 
            transform: 'scale(1.1)', 
            opacity: '0.05',
          },
        },
        'wave-connecting': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.5',
          },
          '50%': { 
            transform: 'scale(1.1)', 
            opacity: '0.2',
          },
        },
        
        // New: Ripple effect
        'ripple': {
          '0%': { 
            transform: 'scale(0.8)', 
            opacity: '0.5',
          },
          '100%': { 
            transform: 'scale(1.5)', 
            opacity: '0',
          },
        },
        
        // New: Glow pulse
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 15px rgba(51, 116, 255, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(51, 116, 255, 0.6)',
          },
        },
        'glow-pulse-error': {
          '0%, 100%': { 
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.6)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, transparent 50%, var(--tw-gradient-to) 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}