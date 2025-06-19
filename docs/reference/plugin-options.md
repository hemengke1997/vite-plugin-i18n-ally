# Plugin Options

## root

- **Type**: `string`
- **Default**: `process.cwd()`

Project root directory

## localesPaths

- **Type**: `string[]`

:::tip
This configuration follows [`vscode-i18n-ally.localesPaths`](https://github.com/lokalise/i18n-ally/wiki/Configurations)
:::

Directories for storing i18n resource files, supports multiple directories.

```json
{
  "i18n-ally.localesPaths": ["./src/locales"]
}
```

Or configure in `vite.config.ts`:

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

- **Type**: `string`

:::tip
This configuration follows [`vscode-i18n-ally.pathMatcher`](https://github.com/lokalise/i18n-ally/wiki/Path-Matcher)
:::

Rules for matching i18n resource files. For more rules, see [Path Matcher](https://github.com/lokalise/i18n-ally/wiki/Path-Matcher).

```json
{
  "i18n-ally.pathMatcher": "{locale}.{ext}"
}
```

Or configure in `vite.config.ts`:

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

- **Type**: `boolean`
- **Default**: `false`

:::tip
This configuration follows [`vscode-i18n-ally.namespace`](https://github.com/lokalise/i18n-ally/wiki/Namespaces)
:::

Enable namespaces. When enabled, the plugin generates corresponding resource files based on namespaces to reduce file size. You also need to modify `pathMatcher` to adapt to `namespace`.

If you want clear resource classification and faster resource loading, it is recommended to enable this configuration.

```json
{
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespace}.{ext}"
}
```

Or configure in `vite.config.ts`:

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

- **Type**: `ParserPlugin[]`

Resource file parser plugins. We have built-in parsers for `json` / `json5` / `yaml` / `yml` / `ts` / `js` files, and you can also customize parser plugins.

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
            // Parse txt file yourself
          },
        }
      ],
    }),
  ],
})
```

## useVscodeI18nAllyConfig

- **Type**: `boolean | { stopAt: string }`
- **Default**: `true`

Whether to use vscode-i18n-ally configuration. By default, the plugin automatically searches for vscode-i18n-ally configuration from the root directory upwards.

If you are not using the vscode-i18n-ally plugin, you can disable this configuration and configure plugin options in `vite.config`.

```ts
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

export default defineConfig({
  plugins: [
    i18nAlly({
      useVscodeI18nAllyConfig: false, // [!code highlight]
      // Other options
    }),
  ],
})
```
