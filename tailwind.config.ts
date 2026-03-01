import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6367FF',
          secondary: '#8494FF',
          tertiary: '#C9BEFF',
          accent: '#FFDBFD',
        },
        neutral: {
          900: '#0F0F1A',
          800: '#1A1A2E',
          700: '#2D2D44',
          600: '#44445E',
          500: '#6B6B85',
          400: '#9494AB',
          300: '#BFBFD1',
          200: '#DDDDE8',
          100: '#EFEFF4',
          50: '#F8F8FC',
        },
        success: { DEFAULT: '#10B981', dark: '#059669', bg: '#ECFDF5' },
        error: { DEFAULT: '#EF4444', dark: '#DC2626', bg: '#FEF2F2' },
        warning: { DEFAULT: '#F59E0B', dark: '#D97706', bg: '#FFFBEB' },
        info: { DEFAULT: '#3B82F6', dark: '#2563EB', bg: '#EFF6FF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['DM Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '8px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 25px rgba(0,0,0,0.1)',
        card: '0 4px 6px rgba(99, 103, 255, 0.15)',
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
};
export default config;
