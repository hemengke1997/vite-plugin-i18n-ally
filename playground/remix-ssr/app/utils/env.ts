import { Env } from 'vite-config-preset/client'

export function getEnv(): string {
  return import.meta.env.MODE
}

export function isDev(): boolean {
  return getEnv() === Env.development
}

export function isTest(): boolean {
  return getEnv() === Env.test
}

export function isProd(): boolean {
  return getEnv() === Env.production
}
