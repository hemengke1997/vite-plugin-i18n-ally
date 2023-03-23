import { createLogger } from 'vite'

const logger = createLogger('info', {
  prefix: '[vite-plugin-i18n-detector]',
})

export { logger }
