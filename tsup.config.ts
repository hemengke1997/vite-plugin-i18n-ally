import { type Options, defineConfig } from 'tsup'

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
    entry: {
      'client/index': 'src/client/index.ts',
    },
    platform: 'browser',
    ...commonConfig(option),
  },
  {
    ...commonConfig(option),
    entry: {
      index: 'src/plugin/index.ts',
    },
    platform: 'node',
    target: 'node16',
    noExternal: ['watcher', 'find-up'],
    format: ['cjs'],
  },
  {
    ...commonConfig(option),
    entry: {
      index: 'src/plugin/index.ts',
    },
    platform: 'node',
    target: 'node16',
    format: ['esm'],
  },
])
