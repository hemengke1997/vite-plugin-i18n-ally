import { defineConfig } from 'tsup'

export const tsup = defineConfig((option) => ({
  entry: {
    'client/index': 'src/client/index.ts',
    'index': 'src/plugin/index.ts',
  },
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  platform: 'node',
  splitting: false,
  treeshake: true,
  minify: false,
  sourcemap: !!option.watch,
  tsconfig: option.watch ? 'tsconfig.dev.json' : 'tsconfig.json',
  external: [/^virtual:.*/],
}))
