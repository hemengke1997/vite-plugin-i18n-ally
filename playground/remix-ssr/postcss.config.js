import { definePlugins } from '@minko-fe/postcss-config/vite'

export default {
  plugins: definePlugins({
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*'],
    },
  }),
}
