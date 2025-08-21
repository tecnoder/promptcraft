import type { Config } from 'tailwindcss'

const config: Config & { safelist?: any[] } = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Custom CSS classes to prevent purging
    'text-gradient-primary',
    'text-gradient-secondary', 
    'text-gradient-accent',
    'text-primary',
    'text-secondary',
    'text-accent',
    'text-success',
    'text-warning',
    'text-error',
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'btn-primary',
    'btn-secondary',
    'card',
    'card-glass',
    'glass',
    'glass-dark',
    'input-modern',
    'shadow-soft',
    'shadow-medium',
    'shadow-large',
    'shadow-colored',
    'mesh-bg',
    'animate-fade-in',
    'animate-slide-up',
    'animate-slide-in-right',
    'custom-scrollbar',
    // Animation delay classes
    {
      pattern: /animate-.*$/,
    },
    // Any gradient classes
    {
      pattern: /gradient-.*$/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          'from': { transform: 'translateX(20px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config 