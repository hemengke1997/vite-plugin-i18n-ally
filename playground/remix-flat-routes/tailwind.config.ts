import { type Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{tsx,ts,html}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
} as Config
