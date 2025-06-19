import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  ignores: ['dist-webview'],
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'react/no-array-index-key': 'off',
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
    'ts/no-require-imports': 'off',
    'style/jsx-quotes': ['error', 'prefer-single'],
    'style/quote-props': ['error', 'consistent'],
    'no-lone-blocks': 'off',
    'dot-notation': 'off',
    'node/prefer-global/process': 'off',
    'no-proto': 'off',
    'no-restricted-properties': 'off',
    'no-restricted-globals': 'off',
    'no-console': 'off',
    'react-dom/no-missing-button-type': 'off',
    'react-refresh/only-export-components': 'off',
    'react/no-unstable-default-props': 'off',
  },
  stylistic: {
    quotes: 'single',
  },
  formatters: {
    css: true,
    markdown: 'prettier',
  },
  markdown: {
    overrides: {
      'no-new': 'off',
    },
  },
})
