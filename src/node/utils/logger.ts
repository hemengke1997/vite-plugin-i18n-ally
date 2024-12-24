import { createLogger } from 'vite'
import { I18nAlly } from './constant'

export const logger = createLogger('info', {
  prefix: `[${I18nAlly}]`,
  allowClearScreen: true,
})
