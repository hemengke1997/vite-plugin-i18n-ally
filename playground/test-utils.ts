// test utils used in e2e tests for playgrounds.
// `import { getColor } from '~utils'`

import path from 'node:path'
import fs from 'fs-extra'
import { type Manifest, normalizePath } from 'vite'
import { expect } from 'vitest'
import { type ConsoleMessage } from 'playwright-chromium'
import { type ExecaChildProcess } from 'execa'
import { isBuild, isWindows, page, testDir } from './vitestSetup'

export * from './vitestSetup'

// make sure these ports are unique
export const ports = {
  spa: 9524,
  ssr: 9525,
}
export const hmrPorts = {
  spa: 24680,
  ssr: 24681,
}

const timeout = (n: number) => new Promise((r) => setTimeout(r, n))

export function readFile(filename: string): string {
  return fs.readFileSync(path.resolve(testDir, filename), 'utf-8')
}

export function editFile(filename: string, replacer: (str: string) => string, runInBuild: boolean = false) {
  if (isBuild && !runInBuild) return
  filename = path.resolve(testDir, filename)
  const content = fs.readFileSync(filename, 'utf-8')
  const modified = replacer(content)
  fs.writeFileSync(filename, modified)
}

export function addFile(filename: string, content: string): void {
  fs.writeFileSync(path.resolve(testDir, filename), content)
}

export function renameDir(dirname: string, to: string) {
  fs.renameSync(path.resolve(testDir, dirname), path.resolve(testDir, to))
}

export function removeFile(filename: string): void {
  fs.unlinkSync(path.resolve(testDir, filename))
}

export function removeDir(dirname: string) {
  fs.rmSync(path.resolve(testDir, dirname), { recursive: true })
}

export function listFiles(dir = ''): string[] {
  const filesDir = path.join(testDir, dir)
  return fs.readdirSync(filesDir)
}

export function listAssets(base = '', assets = 'assets'): string[] {
  const assetsDir = path.join(testDir, 'dist', base, assets)
  return fs.readdirSync(assetsDir)
}

export function findAssetFile(match: string | RegExp, base = '', assets = 'assets'): string {
  const assetsDir = path.join(testDir, 'dist', base, assets)
  let files: string[]
  try {
    files = fs.readdirSync(assetsDir)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return ''
    }
    throw e
  }
  const file = files.find((file) => {
    return file.match(match)
  })
  return file ? fs.readFileSync(path.resolve(assetsDir, file), 'utf-8') : ''
}

export function readManifest(base = ''): Manifest {
  return JSON.parse(fs.readFileSync(path.join(testDir, 'dist', base, 'manifest.json'), 'utf-8'))
}

/**
 * Poll a getter until the value it returns includes the expected value.
 */
export async function untilUpdated(
  poll: () => string | Promise<string>,
  expected: string,
  runInBuild = false,
): Promise<void> {
  if (isBuild && !runInBuild) return
  const maxTries = process.env.CI ? 200 : 50
  for (let tries = 0; tries < maxTries; tries++) {
    const actual = (await poll()) ?? ''
    if (actual.includes(expected) || tries === maxTries - 1) {
      expect(actual).toMatch(expected)
      break
    } else {
      await timeout(50)
    }
  }
}

/**
 * Retry `func` until it does not throw error.
 */
export async function withRetry(func: () => Promise<void>, runInBuild = false): Promise<void> {
  if (isBuild && !runInBuild) return
  const maxTries = process.env.CI ? 200 : 50
  for (let tries = 0; tries < maxTries; tries++) {
    try {
      await func()
      return
    } catch {}
    await timeout(50)
  }
  await func()
}

type UntilBrowserLogAfterCallback = (logs: string[]) => PromiseLike<void> | void

export async function untilBrowserLogAfter(
  operation: () => any,
  target: string | RegExp | (string | RegExp)[],
  expectOrder?: boolean,
  callback?: UntilBrowserLogAfterCallback,
): Promise<string[]>
export async function untilBrowserLogAfter(
  operation: () => any,
  target: string | RegExp | (string | RegExp)[],
  callback?: UntilBrowserLogAfterCallback,
): Promise<string[]>
export async function untilBrowserLogAfter(
  operation: () => any,
  target: string | RegExp | (string | RegExp)[],
  arg3?: boolean | UntilBrowserLogAfterCallback,
  arg4?: UntilBrowserLogAfterCallback,
): Promise<string[]> {
  const expectOrder = typeof arg3 === 'boolean' ? arg3 : false
  const callback = typeof arg3 === 'boolean' ? arg4 : arg3

  const promise = untilBrowserLog(target, expectOrder)
  await operation()
  const logs = await promise
  if (callback) {
    await callback(logs)
  }
  return logs
}

async function untilBrowserLog(target?: string | RegExp | (string | RegExp)[], expectOrder = true): Promise<string[]> {
  let resolve: () => void
  let reject: (reason: any) => void
  const promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const logs = []

  try {
    const isMatch = (matcher: string | RegExp) => (text: string) =>
      typeof matcher === 'string' ? text === matcher : matcher.test(text)

    let processMsg: (text: string) => boolean

    if (!target) {
      processMsg = () => true
    } else if (Array.isArray(target)) {
      if (expectOrder) {
        const remainingTargets = [...target]
        processMsg = (text: string) => {
          const nextTarget = remainingTargets.shift()
          expect(text).toMatch(nextTarget)
          return remainingTargets.length === 0
        }
      } else {
        const remainingMatchers = target.map((element) => isMatch(element))
        processMsg = (text: string) => {
          const nextIndex = remainingMatchers.findIndex((matcher) => matcher(text))
          if (nextIndex >= 0) {
            remainingMatchers.splice(nextIndex, 1)
          }
          return remainingMatchers.length === 0
        }
      }
    } else {
      processMsg = isMatch(target)
    }

    const handleMsg = (msg: ConsoleMessage) => {
      try {
        const text = msg.text()
        if (msg.text().includes('React DevTools')) return
        logs.push(text)
        const done = processMsg(text)
        if (done) {
          resolve()
        }
      } catch (err) {
        reject(err)
      }
    }

    page.on('console', handleMsg)
  } catch (err) {
    reject(err)
  }

  await promise

  return logs
}

export const formatSourcemapForSnapshot = (map: any): any => {
  const root = normalizePath(testDir)
  const m = { ...map }
  delete m.file
  delete m.names
  m.sources = m.sources.map((source) => source.replace(root, '/root'))
  return m
}

// helper function to kill process, uses taskkill on windows to ensure child process is killed too
export async function killProcess(serverProcess: ExecaChildProcess): Promise<void> {
  if (isWindows) {
    try {
      const { execaCommandSync } = await import('execa')
      execaCommandSync(`taskkill /pid ${serverProcess.pid} /T /F`)
    } catch (e) {
      console.error('failed to taskkill:', e)
    }
  } else {
    serverProcess.kill('SIGTERM', { forceKillAfterTimeout: 2000 })
  }
}
