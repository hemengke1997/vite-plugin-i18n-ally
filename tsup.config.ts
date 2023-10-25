import { type Options, defineConfig } from 'tsup'

const commonConfig = (option: Options): Options => {
  return {
    dts: true,
    clean: true,
    minify: false,
    format: ['cjs', 'esm'],
    sourcemap: !!option.watch,
    treeshake: true,
    tsconfig: option.watch ? './tsconfig.dev.json' : './tsconfig.json',
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
    entry: {
      index: 'src/plugin/index.ts',
    },
    platform: 'node',
    target: 'node16',
    ...commonConfig(option),
  },
])
