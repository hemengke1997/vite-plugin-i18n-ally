import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    // PC first
    screens: {
      desktop: {
        max: '1280px',
      },
      // => @media (max-width: 1280px) { ... }

      laptop: {
        max: '1024px',
      },
      // => @media (max-width: 1024px) { ... }

      tablet: {
        max: '640px',
      },
      // => @media (max-width: 640px) { ... }
    },
    extend: {
      colors: {
        '/colors-begin': '',
        // Primary colors
        'primary-1': '#4650F0',
        'primary-2': '#5B6AF5',
        'primary-3': '#757FF5',
        'primary-4': '#97A0F8',
        'primary-5': '#AEB4F5',
        'primary-6': '#FFF',
        // Text colors
        'text-0': '#000000',
        'text-1': '#17171B',
        'text-2': '#1F2128',
        'text-3': '#272B37',
        'text-4': '#363A42',
        'text-5': '#515261',
        'text-6': '#8A8BA1',
        'text-7': '#B7B8C9',
        // Accent colors
        'accent-1': '#3F6FFF',
        'accent-2': '#14F0D6',
        'accent-3': '#00CC96',
        'accent-4': '#FF9F15',
        'accent-5': '#FF6A55',
        '/colors-end': '',
      },
    },
  },
  presets: [require('tailwind-antd-preset')],
  plugins: [
    require('tailwindcss-animate'),
    plugin(function addVars({ addBase, theme }) {
      function extractColorVars(colorObj: Record<string, any>, colorGroup = '', start: string, end: string) {
        const keys = Object.keys(colorObj)
        const startIndex = keys.indexOf(start)
        const endIndex = keys.indexOf(end)
        if (startIndex === -1 || endIndex === -1) {
          return {}
        }

        colorObj = Object.fromEntries(keys.slice(startIndex + 1, endIndex).map((key) => [key, colorObj[key]]))

        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey]

          const newVars =
            typeof value === 'string'
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`, start, end)

          return { ...vars, ...newVars }
        }, {})
      }

      addBase({
        ':root': extractColorVars(theme('colors'), '', '/colors-begin', '/colors-end'),
      })
    }),
    plugin(function addDirection({ addUtilities }) {
      addUtilities({
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
      })
    }),
    plugin(function addBgContainFull({ addUtilities }) {
      addUtilities({
        '.bg-contain-full': {
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        },
      })
      addUtilities({
        '.bg-cover-full': {
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        },
      })
    }),
  ],
  corePlugins: {
    preflight: true,
  },
} as Config

export default config
