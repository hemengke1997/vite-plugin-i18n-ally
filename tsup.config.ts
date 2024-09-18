import { defineConfig, type Options } from 'tsup'
import { bundleless } from 'tsup-plugin-bundleless'

const commonConfig = (option: Options): Options => {
  return {
    dts: true,
    clean: !option.watch,
    minify: false,
    format: ['cjs', 'esm'],
    sourcemap: !!option.watch,
    treeshake: true,
    external: [/^virtual:.*/],
  }
}

export const tsup = defineConfig((option) => [
  {
    ...commonConfig(option),
    entry: ['./src/client/**/*.{ts,tsx}'],
    outDir: 'dist/client',
    format: ['esm'],
    platform: 'browser',
    splitting: false,
    outExtension: () => ({ js: '.js' }),
    plugins: [bundleless({ ext: '.js' })],
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
  {
    ...commonConfig(option),
    entry: {
      index: 'src/node/index.ts',
    },
    platform: 'node',
    target: 'node16',
    noExternal: ['watcher', 'find-up'],
    format: ['cjs'],
  },
  {
    ...commonConfig(option),
    entry: {
      index: 'src/node/index.ts',
    },
    platform: 'node',
    target: 'node16',
    format: ['esm'],
  },
])
