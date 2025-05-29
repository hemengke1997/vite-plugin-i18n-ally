import { name as I18nAllyName } from '../../package.json'

export type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'silent'

export class Logger {
  private logLevel: LogLevel

  constructor(logLevel: LogLevel = 'log') {
    this.logLevel = logLevel
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'log', 'warn', 'error', 'silent']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel) && this.logLevel !== 'silent'
  }

  private log(level: 'log' | 'warn' | 'error' | 'debug', ...args: any[]) {
    if (this.shouldLog(level)) {
      console[level](`[${I18nAllyName}]`, ...args)
    }
  }

  debug(...args: any[]) {
    this.log('debug', ...args)
  }

  logMessage(...args: any[]) {
    this.log('log', ...args)
  }

  warn(...args: any[]) {
    this.log('warn', ...args)
  }

  error(...args: any[]) {
    this.log('error', ...args)
  }
}
