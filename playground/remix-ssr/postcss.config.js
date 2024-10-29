import { definePlugins } from 'postcss-config-preset'

export default {
  plugins: definePlugins({
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*'],
    },
  }),
}
