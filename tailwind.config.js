/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        claude: {
          bg: '#FAF8F5',
          bgWarm: '#F5F2EB',
          card: '#FFFFFF',
          cardMuted: '#F6F3ED',
          border: '#E8E2D7',
          borderSubtle: '#EDE8DF',
          text: '#1F1E1B',
          muted: '#6E675F',
          terracotta: '#CC5A36',
          terracottaHover: '#B54C2B',
          terracottaLight: '#FBF0EB',
          terracottaBorder: '#F2D3C7',
          amber: '#D97757',
          // Warm Espresso dark mode variant
          darkBg: '#131211',
          darkBgWarm: '#1A1816',
          darkCard: '#211F1C',
          darkCardMuted: '#2B2824',
          darkBorder: '#36322C',
          darkText: '#F4EFEA',
          darkMuted: '#9E968D',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Consolas', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'claude-card': '0 2px 12px -2px rgba(31, 30, 27, 0.05), 0 1px 3px 0 rgba(31, 30, 27, 0.03)',
        'claude-hover': '0 12px 28px -4px rgba(204, 90, 54, 0.12), 0 4px 12px -2px rgba(31, 30, 27, 0.04)',
        'claude-glow': '0 0 35px -5px rgba(204, 90, 54, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
