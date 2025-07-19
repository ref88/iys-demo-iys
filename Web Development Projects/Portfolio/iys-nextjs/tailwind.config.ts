import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // IYS Brand Colors
        'iys-purple': '#966aa2',
        'iys-gold': '#b49030',
        'iys-turquoise': '#3ee0cf',
        'iys-pink': '#f4c2c2',
        'iys-green': '#a8b5a0',
      },
      fontFamily: {
        'dancing': ['"Dancing Script"', 'cursive'],
        'libre': ['"Libre Baskerville"', 'serif'],
      },
      animation: {
        'ken-burns': 'kenBurns 8s ease-in-out infinite alternate',
        'particle-float': 'particleFloat 15s ease-in-out infinite',
        'ambient-pulse': 'ambientPulse 20s ease-in-out infinite',
        'aurora-move': 'auroraMove 25s linear infinite',
      },
      keyframes: {
        kenBurns: {
          '0%': { 
            transform: 'scale(1)',
            filter: 'brightness(1) contrast(1)'
          },
          '100%': { 
            transform: 'scale(1.08)',
            filter: 'brightness(1.05) contrast(1.05)'
          }
        },
        particleFloat: {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: '0.3'
          },
          '25%': { 
            transform: 'translateY(-20px) scale(1.2)',
            opacity: '0.7'
          },
          '50%': { 
            transform: 'translateY(-10px) scale(0.8)',
            opacity: '0.5'
          },
          '75%': { 
            transform: 'translateY(-30px) scale(1.1)',
            opacity: '0.8'
          }
        },
        ambientPulse: {
          '0%, 100%': { 
            opacity: '0.7',
            transform: 'scale(1) rotate(0deg)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05) rotate(1deg)'
          }
        },
        auroraMove: {
          '0%': { transform: 'translateX(-100%) rotate(0deg)' },
          '100%': { transform: 'translateX(100%) rotate(3deg)' }
        }
      },
      backdropBlur: {
        '20': '20px',
      }
    },
  },
  plugins: [],
} satisfies Config;