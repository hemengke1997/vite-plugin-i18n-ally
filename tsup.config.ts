import { defineConfig, type Options } from 'tsup'
import { bundleless } from 'tsup-plugin-bundleless'

const commonConfig = (option: Options): Options => {
  return {
    dts: true,
    clean: false,
    minify: false,
    format: ['cjs', 'esm'],
    sourcemap: !!option.watch,
    treeshake: true,
    external: [/^virtual:.*/],
  }
}

export const tsup = defineConfig((option) => {
  const client: Options[] = [
    {
      ...commonConfig(option),
      entry: ['./src/client/**/*.{ts,tsx}'],
      outDir: 'dist/client',
      format: ['esm'],
      platform: 'browser',
      splitting: true,
      ...bundleless(),
    },
    {
      ...commonConfig(option),
      entry: ['./src/client/index.ts'],
      outDir: 'dist/client',
      format: ['cjs'],
      platform: 'neutral',
      splitting: false,
      outExtension: () => ({ js: '.cjs' }),
    },
  ]

  const node: Options[] = [
    {
      ...commonConfig(option),
      entry: {
        index: 'src/node/index.ts',
      },
      platform: 'node',
      noExternal: ['find-up'],
      format: ['cjs'],
    },
    {
      ...commonConfig(option),
      entry: {
        index: 'src/node/index.ts',
      },
      platform: 'node',
      format: ['esm'],
    },
  ]

  const server: Options[] = [
    {
      ...commonConfig(option),
      entry: {
        index: 'src/server/index.ts',
      },
      outDir: 'dist/server',
      platform: 'node',
      format: ['cjs', 'esm'],
      splitting: true,
    },
  ]

  const utils: Options[] = [
    {
      ...commonConfig(option),
      entry: ['src/utils/*.ts'],
      platform: 'neutral',
      format: ['esm', 'cjs'],
      outDir: 'dist/utils',
      splitting: true,
      ...bundleless(),
    },
  ]

  return [...utils, ...client, ...node, ...server]
})
