<p align="center">
  <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vitejs.dev/logo.svg" alt="Vite logo" style="margin-right:16px" />
  </a>
  <span>
    <img width="180" src="./assets/i18n.svg" alt="i18n logo" />
  </span>
</p>
<br/>

<h1 align="center">vite-plugin-i18n-ally</h1>

<p align="center">
  <a href="https://npmjs.com/package/vite-plugin-i18n-ally"><img src="https://img.shields.io/npm/v/vite-plugin-i18n-ally.svg" alt="npm package"></a>
</p>

**English** | [中文](./README.zh.md)

> A vite plugin for lazy loading i18n resources

**NOTE: This plugin is independent of the language framework. Whether you use React or Vue (or any other language), as long as it is vite, you can implement lazy loading of internationalization resources based on this plugin**

## Features

- Seamless development experience, no need to manually import resource files
- **Lazy loading** language resource files to reduce the size of the first screen resource
- Read the configuration items of `i18n-ally` by default, no additional configuration is required
- Support vite hmr out of the box

## Install

```bash
pnpm add vite-plugin-i18n-ally -D
```

## Online Demo

[Demo](https://hemengke1997.github.io/vite-plugin-i18n-ally/)

## Plugin Options

**If `i18n.ally` is configured, the plugin will read the configuration by default**

| Option                  | Type                                    | Default                          | Description                                                                                                                     |
| ----------------------- | --------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| localesPaths            | `string[]`                              | `i18n-ally.localesPaths`         | The directory of language resources, relative to `root`                                                                         |
| root                    | `string`                                | `process.cwd()`                  | The project root path                                                                                                           |
| namespace               | `boolean`                               | `i18n-ally.namespace \|\| false` | Enable namespace                                                                                                                |
| pathMatcher             | `string`                                | auto detected by structure       | Resource file matching rule                                                                                                     |
| parserPlugins           | `ParserPlugin[]`                        | Built-in plugins                 | Resource file parsing plugin                                                                                                    |
| useVscodeI18nAllyConfig | `boolean         \| { stopAt: string }` | `true`                           | Whether to automatically use i18n-ally configuration, if stopAt is passed in, it will stop detecting in the specified directory |

## Config Reference

### vite.config.ts

```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import { i18nAlly } from 'vite-plugin-i18n-ally'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [i18nAlly()],
})
```

## Client Options

| Option           | Type       | Description                                                           |
| ---------------- | ---------- | --------------------------------------------------------------------- |
| language         | `string`   | The current language                                                  |
| namespaces       | `string[]` | Initial namespaces                                                    |
| onInited         | `Function` | Callback after initialization                                         |
| onResourceLoaded | `Function` | Callback after resource loaded                                        |
| fallbackLng      | `string`   | Fallback language                                                     |
| detection        | `Array`    | Language detection and cache, like `i18next-browser-languagedetector` |

## Use with i18next

### main.tsx

```tsx
import React from 'react'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import ReactDOM from 'react-dom/client'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import App from './App'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const { asyncLoadResource } = i18nAlly({
  onInit() {
    i18next.use(initReactI18next).init({
      resources: {}, // !!! important: No resources are added at initialization, otherwise what's lazy loading :)
      nsSeparator: '.',
      keySeparator: '.',
      fallbackLng: 'en',
    })
  },
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (resource, currentLang) => {
    // Once the resource is loaded, add it to i18next
    Object.keys(resources).forEach((ns) => {
      i18next.addResourceBundle(language, ns, resources[ns])
    })
  },
  fallbackLng: 'en',
  detection: [
    {
      detect: 'querystring',
      lookup: 'lang',
    },
    {
      detect: 'cookie',
      lookup: 'cookie-name',
    },
    {
      detect: 'htmlTag',
    },
  ],
})

const i18nextChangeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  // Load resources before language change
  await asyncLoadResource(lang)
  return i18nextChangeLanguage(lang, ...args)
}
```

## Full Example

Please refer to [i18next example](./playground/with-namespace/src/main.tsx)

## vscode i18n-ally configuration reference

### .vscode => settings.json

```json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.namespace": true // If you use `namespace` above, you need to configure
}
```

## ⚠️ Warm Tips

Built-in support for `json` / `json5` / `yaml` / `yml` / `ts` / `js` resource files, customizable plugin parsing language

## Thanks

- [i18n-ally](https://github.com/lokalise/i18n-ally)
- [vite](https://github.com/vitejs/vite)

## License

MIT
