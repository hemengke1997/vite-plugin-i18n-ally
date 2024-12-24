# 插件配置

## root

- **类型**: `string`
- **默认值**: `process.cwd()`

项目根目录

## localesPaths

- **类型**: `string[]`

:::tip
此配置沿用 [`vscode-i18n-ally.localesPaths`](https://github.com/lokalise/i18n-ally/wiki/Configurations)
:::

国际化资源文件存放目录，支持多个目录。

```json
{
  "i18n-ally.localesPaths": ["./src/locales"]
}
```

或在 `vite.config.ts` 中配置

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      localesPaths: ['./src/locales'], // [!code highlight]
    }),
  ],
})
```

## pathMatcher

- **类型**: `string`

:::tip
此配置沿用 [`vscode-i18n-ally.pathMatcher`](https://github.com/lokalise/i18n-ally/wiki/Path-Matcher)
:::

国际化资源文件匹配规则。更多规则请参考 [Path Matcher](https://github.com/lokalise/i18n-ally/wiki/Path-Matcher)

```json
{
  "i18n-ally.pathMatcher": "{locale}.{ext}"
}
```

或在 `vite.config.ts` 中配置

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      pathMatcher: '{locale}.{ext}', // [!code highlight]
    }),
  ],
})
```

## namespace

- **类型**: `boolean`
- **默认值**: `false`

:::tip
此配置沿用 [`vscode-i18n-ally.namespace`](https://github.com/lokalise/i18n-ally/wiki/Namespaces)
:::

是否启用命名空间。启用后，插件会根据命名空间生成对应的资源文件，以减少资源文件大小，同时我们也需要修改 `pathMatcher` 以适配 `namespace`。

如果你希望资源分类清晰，加快资源加载速度，建议开启此配置。

```json
{
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

或在 `vite.config.ts` 中配置

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      namespace: true, // [!code highlight]
      pathMatcher: '{locale}/{namespace}.{ext}', // [!code highlight]
    }),
  ],
})
```

## parserPlugins

- **类型**: `ParserPlugin[]`

资源文件解析插件。我们内置了 `json` / `json5` / `yaml` / `yml` / `ts` / `js` 文件解析插件，你也可以自定义解析插件。

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      parserPlugins: [
        {
          ext: 'txt',
          parse: (text) => {
            // 自行解析 txt 文件
          },
        }
      ],
    }),
  ],
})
```

## useVscodeI18nAllyConfig

- **类型**: `boolean | { stopAt: string }`
- **默认值**: `true`

是否使用 vscode-i18n-ally 配置。默认情况下，插件从根目录向上自动探寻 vscode-i18n-ally 配置

如果你没有使用 vscode-i18n-ally 插件，可以关闭此配置，在 `vite.config` 中配置插件选项

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      useVscodeI18nAllyConfig: false, // [!code highlight]
      // 其他插件选项
    }),
  ],
})
```
