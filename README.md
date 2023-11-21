
<p align="center">
  <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://vitejs.dev/logo.svg" alt="Vite logo" />
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/vite-plugin-i18n-detector"><img src="https://img.shields.io/npm/v/vite-plugin-i18n-detector.svg" alt="npm package"></a>
  <a href="https://npmjs.com/package/vite-plugin-i18n-detector"><img src="https://img.shields.io/npm/dm/vite-plugin-i18n-detector.svg" alt="downloads"></a>
</p>


# vite-plugin-i18n-detector

**English** | [中文](./README-zh.md)

> A vite plugin for lazy loading i18n resources

**NOTE: This plugin is independent of the language framework. Whether you use React or Vue (or any other language), as long as it is vite, you can implement lazy loading of internationalization resources based on this plugin**

## Features

- Seamless development experience, no need to manually import resource files
- **Lazy loading** language resource files to reduce the size of the first screen resource
- Configuration items similar to `i18n-ally`, easier to get started

## Install

```bash
pnpm add vite-plugin-i18n-detector -D
```

## Online Demo
[Demo](https://hemengke1997.github.io/vite-plugin-i18n-detector/)

## Options

| Option        | Type             | Default                                 | Description                                                   |
| ------------- | ---------------- | --------------------------------------- | ------------------------------------------------------------- |
| localesPaths  | `string[]`       | `['./src/locales', './locales']`        | The directory address where the language resources are stored |
| pathMatcher   | `string`         | `{locale}/{namespaces}.{ext}`           | Resource file matching rule                                   |
| parserPlugins | `ParserPlugin[]` | `[jsonParser, json5Parser, yamlParser]` | Resource file parsing plugin                                  |
| root          | `string`         | `process.cwd()`                         | Project root directory                                        |

## Config Reference

### vite.config.ts
```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import { i18nDetector } from 'vite-plugin-i18n-detector'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    i18nDetector({
      localesPaths: ['./src/locales'],
    }),
  ],
})
```

## Use with React-i18next

### main.tsx

```tsx
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initReactI18next } from 'react-i18next'
import { setupI18n } from 'vite-plugin-i18n-detector/client'
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
    fallbackLng,
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
      caches: ['localStorage', 'sessionStorage', 'cookie'],
      lookupQuerystring: lookupTarget,
      // ... For more configurations, please refer to `i18next-browser-languagedetector`
    },
  })


const { loadResourceByLang } = setupI18n({
  language: i18next.language,
  onInited() {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  },
  onResourceLoaded: (langs, currentLang) => { // Once the resource is loaded, add it to i18next
    Object.keys(langs).forEach((ns) => {
      i18next.addResourceBundle(currentLang, ns, langs[ns])
    })
  },
  fallbackLng,
  query: {
    url: lookupTarget,
  },
})

const _changeLanguage = i18next.changeLanguage
i18next.changeLanguage = async (lang: string, ...args) => {
  const currentLng = lang

  // Load resources before language change
  await loadResourceByLang(currentLng)
  return _changeLanguage(currentLng, ...args)
}
```

## Full Example

Please refer to [i18next example](./playground/spa/src/main.tsx)

## vscode i18n-ally configuration reference

### .vscode => settings.json
``` json
{
  "i18n-ally.localesPaths": ["src/locales"],
  "i18n-ally.keystyle": "flat",
  "i18n-ally.enabledParsers": ["json", "json5", "yaml"],
  "i18n-ally.enabledFrameworks": ["react", "i18next"],
  "i18n-ally.namespace": true,
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
}
```

## ⚠️ Warm Tips

Built-in support for `json` / `json5` / `yaml` / `yml` resource files, customizable plugin parsing language

## Thanks

- [i18n-ally](https://github.com/lokalise/i18n-ally)
- [vite](https://github.com/vitejs/vite)

## License

MIT
