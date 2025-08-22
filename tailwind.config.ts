import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gradient-start': '#10b981',
        'gradient-mid': '#3b82f6',
        'gradient-end': '#8b5cf6',
        'emerald': {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        'blue': {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradientShift 6s ease infinite',
        'gradient-pulse': 'gradientPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        gradientPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(45deg, #ffc400, #ff9100, #ff530f, #e62c6d, #b25aff)',
        'gradient-warm': 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
        'gradient-cool': 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
        'gradient-fire': 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
      },
    },
  },
  plugins: [],
}

export default config 