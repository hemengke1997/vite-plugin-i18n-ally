
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

## Options

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
  plugins: [
    i18nAlly(),
  ],
})
```

## Use with i18next

### main.tsx

```tsx
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import { i18nAlly } from 'vite-plugin-i18n-ally/client'
import App from './App'

const root = ReactDOM.createRoot(document.querySelector('#root') as HTMLElement)

const lookupTarget = 'lang'
const fallbackLng = 'en'

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {}, // !!! important: No resources are added at initialization, otherwise what's lazy loading :)
    nsSeparator: '.',
    keySeparator: '.',
    fallbackLng,
    detection: {
      lookupQuerystring: lookupTarget,
      // ... For more configurations, please refer to `i18next-browser-languagedetector`
    },
  })


const { beforeLanguageChange } = i18nAlly({
  language: i18next.language,
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (resource, currentLang) => { // Once the resource is loaded, add it to i18next
    Object.keys(resource).forEach((ns) => {
      i18next.addResourceBundle(currentLang, ns, resource[ns])
    })
  },
  fallbackLng,
  cache: {
    querystring: lookupTarget,
  },
})

const i18nextChangeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  // Load resources before language change
  await beforeLanguageChange(lang)
  return i18nextChangeLanguage(lang, ...args)
}
```

## Full Example

Please refer to [i18next example](./playground/spa-with-namespace/src/main.tsx)

## vscode i18n-ally configuration reference

### .vscode => settings.json
``` json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
  "i18n-ally.namespace": true,  // If you use `namespace` above, you need to configure
}
```

## ⚠️ Warm Tips

Built-in support for `json` / `json5` / `yaml` / `yml` / `ts` / `js` resource files, customizable plugin parsing language

## Thanks

- [i18n-ally](https://github.com/lokalise/i18n-ally)
- [vite](https://github.com/vitejs/vite)

## License

MIT
